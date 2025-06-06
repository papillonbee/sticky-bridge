document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    
    hamburger.onclick = () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
    };
    
    overlay.onclick = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };

    const toggle = document.getElementById("toggle-bot");
    toggle.checked = false;
});
