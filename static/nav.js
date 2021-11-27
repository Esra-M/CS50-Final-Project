const toggleButton = document.getElementsByClassName("toggle-button")[0]
const navbarLinks = document.getElementsByClassName("navbar-links")[0]
const login = document.getElementsByClassName("login")[0]

toggleButton.addEventListener('click', () => {
    if (navbarLinks) {
        navbarLinks.classList.toggle('active')
    }
    login.classList.toggle('active')
})