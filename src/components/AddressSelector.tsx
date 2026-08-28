import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  AdministrativeProvince,
  AdministrativeWard,
  AddressSuggestionItem,
  CustomerAddressData,
} from '../types';
import { addressService } from '../services/addressService';

export interface AddressSelectorProps {
  value?: Partial<CustomerAddressData>;
  onChange: (data: CustomerAddressData) => void;
  showNoteField?: boolean;
  noteValue?: string;
  onNoteChange?: (note: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  idPrefix?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  value,
  onChange,
  showNoteField = true,
  noteValue = '',
  onNoteChange,
  required = true,
  disabled = false,
  className = '',
  idPrefix = 'addr',
}) => {
  // ----------------------------------------------------
  // 1. Internal State
  // ----------------------------------------------------
  const [provinces, setProvinces] = useState<AdministrativeProvince[]>([]);
  const [wards, setWards] = useState<AdministrativeWard[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(true);
  const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false);

  // Selected values
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>(value?.province_code || '');
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>(value?.province_name || '');
  const [selectedWardCode, setSelectedWardCode] = useState<string>(value?.ward_code || '');
  const [selectedWardName, setSelectedWardName] = useState<string>(value?.ward_name || '');

  // Ward search / input state
  const [wardInput, setWardInput] = useState<string>(value?.ward_name || '');
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState<boolean>(false);
  const [wardHighlightedIndex, setWardHighlightedIndex] = useState<number>(-1);
  const [apiWards, setApiWards] = useState<AdministrativeWard[]>([]);
  const [isSearchingWards, setIsSearchingWards] = useState<boolean>(false);
  const wardDropdownRef = useRef<HTMLDivElement>(null);
  const wardInputRef = useRef<HTMLInputElement>(null);
  const wardAbortControllerRef = useRef<AbortController | null>(null);
  const wardDebounceTimerRef = useRef<any>(null);

  // Specific address field & components
  const [specificAddressInput, setSpecificAddressInput] = useState<string>(
    value?.house_number && value?.street
      ? `${value.house_number} ${value.street}`.trim()
      : value?.street || value?.house_number || ''
  );
  const [houseNumber, setHouseNumber] = useState<string>(value?.house_number || '');
  const [street, setStreet] = useState<string>(value?.street || '');
  const [latitude, setLatitude] = useState<number | null>(value?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(value?.longitude ?? null);

  // Autocomplete UI state
  const [suggestions, setSuggestions] = useState<AddressSuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Helper to remove Vietnamese tones for flexible search
  const removeVietnameseTones = useCallback((str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }, []);

  // Live API Search for Wards (Debounced)
  const performWardSearch = useCallback(
    async (queryText: string) => {
      const q = queryText.trim();
      if (!q) {
        setApiWards([]);
        setIsSearchingWards(false);
        return;
      }

      if (wardAbortControllerRef.current) {
        wardAbortControllerRef.current.abort();
      }
      wardAbortControllerRef.current = new AbortController();

      setIsSearchingWards(true);

      try {
        const results = await addressService.searchWards(
          q,
          {
            provinceCode: selectedProvinceCode,
            provinceName: selectedProvinceName,
          },
          wardAbortControllerRef.current.signal
        );
        setApiWards(results);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('performWardSearch error:', err);
        }
      } finally {
        setIsSearchingWards(false);
      }
    },
    [selectedProvinceCode, selectedProvinceName]
  );

  // Merged Filtered Wards from API and local database
  const filteredWards = useMemo(() => {
    if (!wardInput.trim()) return wards;
    const q = removeVietnameseTones(wardInput);

    const map = new Map<string, AdministrativeWard>();

    // 1. Kết quả từ API backend / VIETMAP
    apiWards.forEach((w) => {
      map.set(w.name.toLowerCase().trim(), w);
    });

    // 2. Kết quả từ danh mục hành chính
    wards.forEach((w) => {
      const wardNameNorm = removeVietnameseTones(w.name);
      if (wardNameNorm.includes(q) || w.code.includes(q)) {
        if (!map.has(w.name.toLowerCase().trim())) {
          map.set(w.name.toLowerCase().trim(), w);
        }
      }
    });

    return Array.from(map.values());
  }, [wards, wardInput, apiWards, removeVietnameseTones]);

  // Keep wardInput in sync with selectedWardName
  useEffect(() => {
    if (selectedWardName && selectedWardName !== wardInput) {
      setWardInput(selectedWardName);
    }
  }, [selectedWardName]);

  // ----------------------------------------------------
  // 2. Fetch Provinces on Mount
  // ----------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProvinces(true);

    addressService
      .getProvinces()
      .then((provList) => {
        if (!isMounted) return;
        setProvinces(provList);

        // Auto-select if value is provided or default to HCM if empty
        if (value?.province_code) {
          setSelectedProvinceCode(value.province_code);
          const found = provList.find((p) => p.code === value.province_code);
          if (found) setSelectedProvinceName(found.name);
        } else if (value?.province_name) {
          const found = provList.find(
            (p) => p.name.toLowerCase() === value.province_name?.toLowerCase()
          );
          if (found) {
            setSelectedProvinceCode(found.code);
            setSelectedProvinceName(found.name);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingProvinces(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value?.province_code && value.province_code !== selectedProvinceCode) {
      setSelectedProvinceCode(value.province_code);
    }
    if (value?.province_name && value.province_name !== selectedProvinceName) {
      setSelectedProvinceName(value.province_name);
    }
    if (value?.ward_code && value.ward_code !== selectedWardCode) {
      setSelectedWardCode(value.ward_code);
    }
    if (value?.ward_name && value.ward_name !== selectedWardName) {
      setSelectedWardName(value.ward_name);
      setWardInput(value.ward_name);
    }
    if (value?.latitude !== undefined) setLatitude(value.latitude ?? null);
    if (value?.longitude !== undefined) setLongitude(value.longitude ?? null);
  }, [value?.province_code, value?.province_name, value?.ward_code, value?.ward_name, value?.latitude, value?.longitude]);

  // ----------------------------------------------------
  // 3. Fetch Wards when Province changes
  // ----------------------------------------------------
  useEffect(() => {
    if (!selectedProvinceCode) {
      setWards([]);
      return;
    }

    let isMounted = true;
    setIsLoadingWards(true);

    addressService
      .getWards(selectedProvinceCode)
      .then((wardList) => {
        if (!isMounted) return;
        setWards(wardList);

        // Verify if current ward matches
        if (selectedWardCode) {
          const match = wardList.find((w) => w.code === selectedWardCode);
          if (match) {
            setSelectedWardName(match.name);
            setWardInput(match.name);
          }
        } else if (value?.ward_name) {
          const match = wardList.find(
            (w) => w.name.toLowerCase() === value.ward_name?.toLowerCase()
          );
          if (match) {
            setSelectedWardCode(match.code);
            setSelectedWardName(match.name);
            setWardInput(match.name);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingWards(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProvinceCode]);

  // ----------------------------------------------------
  // 4. Compute Full Address & Emit onChange
  // ----------------------------------------------------
  const computedFullAddress = useMemo(() => {
    const parts: string[] = [];
    if (specificAddressInput.trim()) {
      parts.push(specificAddressInput.trim());
    } else {
      if (houseNumber.trim()) parts.push(houseNumber.trim());
      if (street.trim()) parts.push(street.trim());
    }
    if (selectedWardName.trim()) parts.push(selectedWardName.trim());
    if (selectedProvinceName.trim()) parts.push(selectedProvinceName.trim());

    return parts.join(', ');
  }, [specificAddressInput, houseNumber, street, selectedWardName, selectedProvinceName]);

  const emitChange = useCallback(
    (override?: Partial<CustomerAddressData>) => {
      const data: CustomerAddressData = {
        province_code: override?.province_code ?? selectedProvinceCode,
        province_name: override?.province_name ?? selectedProvinceName,
        ward_code: override?.ward_code ?? selectedWardCode,
        ward_name: override?.ward_name ?? selectedWardName,
        house_number: override?.house_number ?? houseNumber,
        street: override?.street ?? street,
        full_address: override?.full_address ?? computedFullAddress,
        latitude: override?.latitude !== undefined ? override.latitude : latitude,
        longitude: override?.longitude !== undefined ? override.longitude : longitude,
        note: noteValue,
      };
      onChange(data);
    },
    [
      selectedProvinceCode,
      selectedProvinceName,
      selectedWardCode,
      selectedWardName,
      houseNumber,
      street,
      computedFullAddress,
      latitude,
      longitude,
      noteValue,
      onChange,
    ]
  );

  // ----------------------------------------------------
  // 5. Handle Province Change
  // ----------------------------------------------------
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const found = provinces.find((p) => p.code === code);
    const name = found ? found.name : '';

    setSelectedProvinceCode(code);
    setSelectedProvinceName(name);

    // Reset Ward & Autocomplete input as requested
    setSelectedWardCode('');
    setSelectedWardName('');
    setWardInput('');
    setIsWardDropdownOpen(false);
    setSuggestions([]);
    setIsDropdownOpen(false);

    emitChange({
      province_code: code,
      province_name: name,
      ward_code: '',
      ward_name: '',
      latitude: null,
      longitude: null,
    });
  };

  // ----------------------------------------------------
  // 6. Handle Ward Selection & Input Change
  // ----------------------------------------------------
  const handleSelectWard = (ward: AdministrativeWard) => {
    setSelectedWardCode(ward.code);
    setSelectedWardName(ward.name);
    setWardInput(ward.name);
    setIsWardDropdownOpen(false);
    setWardHighlightedIndex(-1);

    emitChange({
      ward_code: ward.code,
      ward_name: ward.name,
    });
  };

  const handleWardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setWardInput(text);
    setSelectedWardName(text);
    setIsWardDropdownOpen(true);
    setWardHighlightedIndex(-1);

    // Debounce API ward search
    if (wardDebounceTimerRef.current) {
      clearTimeout(wardDebounceTimerRef.current);
    }
    wardDebounceTimerRef.current = setTimeout(() => {
      performWardSearch(text);
    }, 280);

    // Check if it matches an exact ward
    const exactMatch =
      wards.find((w) => removeVietnameseTones(w.name) === removeVietnameseTones(text)) ||
      apiWards.find((w) => removeVietnameseTones(w.name) === removeVietnameseTones(text));

    if (exactMatch) {
      setSelectedWardCode(exactMatch.code);
      emitChange({
        ward_code: exactMatch.code,
        ward_name: exactMatch.name,
      });
    } else {
      setSelectedWardCode('');
      emitChange({
        ward_code: '',
        ward_name: text,
      });
    }
  };

  const handleWardKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isWardDropdownOpen || filteredWards.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsWardDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setWardHighlightedIndex((prev) => (prev < filteredWards.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setWardHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredWards.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (wardHighlightedIndex >= 0 && wardHighlightedIndex < filteredWards.length) {
        handleSelectWard(filteredWards[wardHighlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsWardDropdownOpen(false);
    }
  };

  // ----------------------------------------------------
  // 7. VIETMAP Autocomplete Search Logic (Debounced 400ms)
  // ----------------------------------------------------
  const performSearch = useCallback(
    async (queryText: string) => {
      const q = queryText.trim();
      if (!q || q.length < 3) {
        setSuggestions([]);
        setIsSearching(false);
        setSearchError(null);
        setHasSearched(false);
        return;
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      setSearchError(null);
      setHasSearched(true);
      setHighlightedIndex(-1);

      try {
        const results = await addressService.autocomplete(
          q,
          {
            provinceCode: selectedProvinceCode,
            wardCode: selectedWardCode,
            provinceName: selectedProvinceName,
            wardName: selectedWardName,
          },
          abortControllerRef.current.signal
        );

        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setSearchError('Không thể tìm kiếm địa chỉ. Vui lòng thử lại.');
        }
      } finally {
        setIsSearching(false);
      }
    },
    [selectedProvinceCode, selectedWardCode, selectedProvinceName, selectedWardName]
  );

  const handleSpecificAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSpecificAddressInput(text);

    // Try basic house number & street extraction
    const match = text.match(/^(\d+[\w/-]*)\s*(.*)$/);
    if (match) {
      setHouseNumber(match[1] || '');
      setStreet(match[2] || '');
    } else {
      setStreet(text);
    }

    // Debounce VIETMAP search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(text);
      }, 400);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setHasSearched(false);
    }

    emitChange({
      house_number: match ? match[1] : '',
      street: match ? match[2] : text,
    });
  };

  // ----------------------------------------------------
  // 8. Handle Select Suggestion Item
  // ----------------------------------------------------
  const handleSelectSuggestion = async (item: AddressSuggestionItem) => {
    setIsDropdownOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);

    const house = item.house_number || '';
    const str = item.street || '';
    const formattedSpecific = house && str ? `${house} ${str}` : str || house || item.display;

    setSpecificAddressInput(formattedSpecific);
    setHouseNumber(house);
    setStreet(str);
    setLatitude(item.latitude);
    setLongitude(item.longitude);

    // Auto-match province if returned
    let newProvCode = selectedProvinceCode;
    let newProvName = selectedProvinceName;
    if (item.province) {
      const matchProv = provinces.find(
        (p) =>
          p.name.toLowerCase().includes(item.province!.toLowerCase()) ||
          item.province!.toLowerCase().includes(p.name.toLowerCase())
      );
      if (matchProv) {
        newProvCode = matchProv.code;
        newProvName = matchProv.name;
        setSelectedProvinceCode(matchProv.code);
        setSelectedProvinceName(matchProv.name);
      }
    }

    // Auto-match ward if returned
    let newWardCode = selectedWardCode;
    let newWardName = selectedWardName;
    if (item.ward) {
      const matchWard = wards.find(
        (w) =>
          w.name.toLowerCase().includes(item.ward!.toLowerCase()) ||
          item.ward!.toLowerCase().includes(w.name.toLowerCase())
      );
      if (matchWard) {
        newWardCode = matchWard.code;
        newWardName = matchWard.name;
        setSelectedWardCode(matchWard.code);
        setSelectedWardName(matchWard.name);
      } else {
        setSelectedWardName(item.ward);
        newWardName = item.ward;
      }
    }

    // If ref_id is available and lat/lng is missing, fetch Place Detail
    let finalLat = item.latitude;
    let finalLng = item.longitude;
    if ((!finalLat || !finalLng) && item.id && !item.id.startsWith('fb_')) {
      const detail = await addressService.getPlaceDetail(item.id);
      if (detail && detail.latitude && detail.longitude) {
        finalLat = detail.latitude;
        finalLng = detail.longitude;
        setLatitude(detail.latitude);
        setLongitude(detail.longitude);
      }
    }

    emitChange({
      province_code: newProvCode,
      province_name: newProvName,
      ward_code: newWardCode,
      ward_name: newWardName,
      house_number: house,
      street: str,
      full_address: item.display || computedFullAddress,
      latitude: finalLat,
      longitude: finalLng,
    });
  };

  // ----------------------------------------------------
  // 9. Keyboard Navigation & Click Outside
  // ----------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        wardDropdownRef.current &&
        !wardDropdownRef.current.contains(event.target as Node) &&
        wardInputRef.current &&
        !wardInputRef.current.contains(event.target as Node)
      ) {
        setIsWardDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`space-y-3.5 ${className}`} id={`${idPrefix}_container`}>
      {/* ------------------------------------------------ */}
      {/* ROW 1: Tỉnh / Thành phố & Phường / Xã */}
      {/* ------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dropdown Tỉnh / Thành phố */}
        <div>
          <label
            htmlFor={`${idPrefix}_province`}
            className="block text-[11px] font-bold text-[#414751] mb-1 uppercase tracking-wider"
          >
            Tỉnh / Thành phố {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}_province`}
              disabled={disabled || isLoadingProvinces}
              value={selectedProvinceCode}
              onChange={handleProvinceChange}
              required={required}
              className="w-full bg-white border border-[#c1c7d3] rounded-xl px-3.5 py-2.5 text-xs text-[#141b2b] font-medium focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all appearance-none cursor-pointer pr-9 shadow-2xs"
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
              {isLoadingProvinces ? 'sync' : 'expand_more'}
            </span>
          </div>
        </div>

        {/* Searchable / Autocomplete Phường / Xã Combobox */}
        <div className="relative">
          <label
            htmlFor={`${idPrefix}_ward`}
            className="block text-[11px] font-bold text-[#414751] mb-1 uppercase tracking-wider"
          >
            Phường / Xã {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              ref={wardInputRef}
              id={`${idPrefix}_ward`}
              type="text"
              disabled={disabled || !selectedProvinceCode || isLoadingWards}
              required={required}
              value={wardInput}
              onChange={handleWardInputChange}
              onFocus={() => {
                if (selectedProvinceCode) {
                  setIsWardDropdownOpen(true);
                }
              }}
              onKeyDown={handleWardKeyDown}
              placeholder={
                !selectedProvinceCode
                  ? 'Vui lòng chọn Tỉnh/Thành trước'
                  : isLoadingWards
                  ? 'Đang tải danh sách Phường/Xã...'
                  : 'Nhập tìm hoặc chọn Phường / Xã...'
              }
              className="w-full bg-white border border-[#c1c7d3] rounded-xl pl-3.5 pr-14 py-2.5 text-xs text-[#141b2b] placeholder-gray-400 focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-2xs font-medium"
            />

            {/* Right Icons: Clear & Dropdown Toggle */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isLoadingWards || isSearchingWards ? (
                <div className="w-4 h-4 border-2 border-[#005396] border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <>
                  {wardInput && (
                    <button
                      type="button"
                      disabled={disabled || !selectedProvinceCode}
                      onClick={() => {
                        setWardInput('');
                        setSelectedWardCode('');
                        setSelectedWardName('');
                        setApiWards([]);
                        setIsWardDropdownOpen(true);
                        emitChange({ ward_code: '', ward_name: '' });
                      }}
                      className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer rounded-full"
                      title="Xóa phường xã"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={disabled || !selectedProvinceCode || isLoadingWards}
                    onClick={() => setIsWardDropdownOpen((prev) => !prev)}
                    className="text-gray-400 hover:text-[#005396] p-0.5 cursor-pointer rounded-md transition-colors"
                    title="Mở danh sách Phường / Xã"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isWardDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Wards Suggestion Dropdown */}
          {isWardDropdownOpen && selectedProvinceCode && (
            <div
              ref={wardDropdownRef}
              id={`${idPrefix}_ward_dropdown`}
              className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#c1c7d3]/80 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100"
            >
              <div className="px-3 py-1.5 bg-[#f8f9ff] text-[11px] font-bold text-[#005396] flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
                <span className="flex items-center gap-1.5">
                  {isSearchingWards ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[#005396] border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tìm kiếm gợi ý từ API...</span>
                    </>
                  ) : (
                    <span>
                      {wardInput.trim()
                        ? `Gợi ý Phường / Xã (${filteredWards.length})`
                        : `Danh sách Phường / Xã (${wards.length})`}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-400 font-normal">Dùng phím ↑ ↓ Enter</span>
              </div>

              {filteredWards.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-500">
                  <span className="material-symbols-outlined text-gray-300 text-xl block mb-0.5">
                    search_off
                  </span>
                  Không tìm thấy "{wardInput}". Tên bạn nhập sẽ được lưu tự động.
                </div>
              ) : (
                filteredWards.map((w, idx) => {
                  const isSelected = w.code === selectedWardCode || w.name === selectedWardName;
                  const isHighlighted = idx === wardHighlightedIndex;
                  return (
                    <div
                      key={w.code || idx}
                      onClick={() => handleSelectWard(w)}
                      onMouseEnter={() => setWardHighlightedIndex(idx)}
                      className={`px-3.5 py-2 cursor-pointer transition-colors text-xs font-medium flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#e9edff] text-[#005396] font-bold'
                          : isHighlighted
                          ? 'bg-gray-100 text-[#005396]'
                          : 'hover:bg-gray-50 text-[#141b2b]'
                      }`}
                    >
                      <span className="truncate">{w.name}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#005396] text-base shrink-0">
                          check
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* ROW 2: Nhập Địa chỉ cụ thể & VIETMAP Autocomplete */}
      {/* ------------------------------------------------ */}
      <div className="relative">
        <label
          htmlFor={`${idPrefix}_specific_address`}
          className="block text-[11px] font-bold text-[#414751] mb-1 uppercase tracking-wider"
        >
          Số nhà &amp; Tên đường cụ thể {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#005396] text-lg pointer-events-none">
            pin_drop
          </span>
          <input
            ref={inputRef}
            id={`${idPrefix}_specific_address`}
            type="text"
            disabled={disabled}
            required={required}
            value={specificAddressInput}
            onChange={handleSpecificAddressInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ví dụ: 123 Lê Lợi, Chung cư Vincom..."
            className="w-full bg-white border border-[#c1c7d3] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#141b2b] placeholder-gray-400 focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] disabled:bg-gray-100 transition-all shadow-2xs font-medium"
          />

          {/* Right Icon: Search indicator / Clear */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-[#005396] border-t-transparent rounded-full animate-spin"></div>
            ) : specificAddressInput ? (
              <button
                type="button"
                onClick={() => {
                  setSpecificAddressInput('');
                  setHouseNumber('');
                  setStreet('');
                  setLatitude(null);
                  setLongitude(null);
                  setSuggestions([]);
                  setIsDropdownOpen(false);
                  emitChange({ house_number: '', street: '', latitude: null, longitude: null });
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="Xóa ô nhập"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Dropdown Suggestions List */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            id={`${idPrefix}_suggestions_dropdown`}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#c1c7d3]/70 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-gray-100"
          >
            {/* Header info */}
            <div className="px-3.5 py-1.5 bg-[#f8f9ff] text-[11px] font-bold text-[#005396] flex items-center justify-between border-b border-gray-100">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                <span>Gợi ý địa chỉ ({suggestions.length})</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Dùng phím ↑ ↓ Enter</span>
            </div>

            {/* Error state */}
            {searchError && (
              <div className="p-3 text-center text-xs text-red-500 font-medium">
                {searchError}
              </div>
            )}

            {/* Empty state */}
            {!isSearching && !searchError && suggestions.length === 0 && hasSearched && (
              <div className="p-4 text-center text-xs text-gray-500">
                <span className="material-symbols-outlined text-gray-300 text-2xl block mb-1">
                  search_off
                </span>
                Không tìm thấy địa chỉ phù hợp với "{specificAddressInput}". Bạn có thể tiếp tục nhập số nhà &amp; đường thủ công.
              </div>
            )}

            {/* Suggestions list */}
            {suggestions.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={item.id || index}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3.5 py-2.5 cursor-pointer transition-colors flex items-start gap-2.5 ${
                    isHighlighted ? 'bg-[#e9edff] text-[#005396]' : 'hover:bg-gray-50 text-[#141b2b]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                      isHighlighted ? 'text-[#005396]' : 'text-gray-400'
                    }`}
                  >
                    location_on
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug break-words">
                      {item.display}
                    </p>
                    {item.address && item.address !== item.display && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.address}</p>
                    )}
                  </div>
                  {item.latitude && item.longitude && (
                    <span className="text-[10px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded border border-green-200 shrink-0">
                      GPS
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------ */}
      {/* ROW 3: Optional Location Note */}
      {/* ------------------------------------------------ */}
      {showNoteField && (
        <div>
          <label
            htmlFor={`${idPrefix}_note`}
            className="block text-[11px] font-bold text-[#414751] mb-1 uppercase tracking-wider"
          >
            Ghi chú chi tiết vị trí (Tầng, tòa nhà, mã cửa, v.v.)
          </label>
          <input
            id={`${idPrefix}_note`}
            type="text"
            disabled={disabled}
            value={noteValue}
            onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
            placeholder="Ví dụ: Tầng 4, phòng 402, chung cư Landmark 81..."
            className="w-full bg-white border border-[#c1c7d3] rounded-xl px-3.5 py-2.5 text-xs text-[#141b2b] placeholder-gray-400 focus:outline-none focus:border-[#005396] focus:ring-1 focus:ring-[#005396] disabled:bg-gray-100 transition-all shadow-2xs font-medium"
          />
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* PREVIEW & GPS COORDINATES CARD */}
      {/* ------------------------------------------------ */}
      {computedFullAddress && (
        <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#005396]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-start gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#005396] text-lg shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="text-xs min-w-0">
              <span className="font-bold text-[#005396]">Địa chỉ đầy đủ: </span>
              <span className="text-[#141b2b] font-medium break-words">{computedFullAddress}</span>
              {latitude && longitude && (
                <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <span className="material-symbols-outlined text-[13px]">my_location</span>
                    <span>Tọa độ GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {latitude && longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 bg-white hover:bg-gray-50 text-[#005396] border border-[#005396]/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
              title="Mở vị trí trên bản đồ ngoài"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              <span>Xem bản đồ</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
