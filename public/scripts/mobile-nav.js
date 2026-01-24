document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!hamburger || !sidebar || !overlay) return;

    const openSidebar = () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    };

    const closeSidebar = () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    };

    hamburger.addEventListener("click", openSidebar);
    overlay.addEventListener("click", closeSidebar);
});
