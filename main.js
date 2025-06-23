// JavaScript source code
// main.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const thankYouMsg = document.getElementById("thankYouMsg");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.reset();
        thankYouMsg.classList.remove("d-none");
    });
});

