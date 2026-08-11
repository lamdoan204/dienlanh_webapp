const nodemailer = require('nodemailer');

async function test(email, pass) {
  console.log("Testing:", email, pass);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: email, pass: pass }
  });
  return new Promise((resolve) => {
    transporter.verify(function(error, success) {
      if (error) {
        console.log("Error for", email, ":", error.message);
      } else {
        console.log("Success for", email);
      }
      resolve();
    });
  });
}

async function run() {
  await test('doanquanglam0712@gmail.com', 'tzfawvktldckvovj');
}
run();
