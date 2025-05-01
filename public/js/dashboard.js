// Check if username (PIN) is set, else redirect to login
if (!localStorage.getItem('username')) {
    window.location.href = '/auth/admin-login';
}

function handleLogout(event) {
    event.preventDefault();
    fetch('/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    }).then(() => {
        localStorage.setItem('username', null);
        window.location.href = '/auth/admin-login';
    });
}
