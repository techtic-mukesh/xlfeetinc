document.addEventListener('DOMContentLoaded', () => {
  const passwordInput =
    document.querySelector('input[name="customer[password]"], #CustomerPassword, #RegisterForm-password');

  const confirmInput =
    document.querySelector('input[name="customer[password_confirmation]"], #RegisterForm-password-confirm');

  if (!passwordInput) return;

  const showSvg = `
    <svg class="icon icon-show" aria-hidden="true" focusable="false" width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.0765 6.45833C11.0765 7.83905 9.95717 8.95833 8.57646 8.95833C7.19574 8.95833 6.07646 7.83905 6.07646 6.45833C6.07646 5.07762 7.19574 3.95833 8.57646 3.95833C9.95717 3.95833 11.0765 5.07762 11.0765 6.45833Z" stroke="currentColor" stroke-width="1.25"/>
      <path d="M8.57682 0.625C4.84546 0.625 1.6869 3.0774 0.625 6.4583C1.68688 9.83924 4.84546 12.2917 8.57684 12.2917C12.3082 12.2917 15.4668 9.83927 16.5287 6.45836C15.4668 3.07743 12.3082 0.625 8.57682 0.625Z" stroke="currentColor" stroke-width="1.25"/>
    </svg>`;

  const hideSvg = `
    <svg class="icon icon-hide" aria-hidden="true" focusable="false" width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.0765 6.45833C11.0765 7.83905 9.95717 8.95833 8.57646 8.95833C7.19574 8.95833 6.07646 7.83905 6.07646 6.45833C6.07646 5.07762 7.19574 3.95833 8.57646 3.95833C9.95717 3.95833 11.0765 5.07762 11.0765 6.45833Z" stroke="currentColor" stroke-width="1.25"/>
      <path d="M8.57682 0.625C4.84546 0.625 1.6869 3.0774 0.625 6.4583C1.68688 9.83924 4.84546 12.2917 8.57684 12.2917C12.3082 12.2917 15.4668 9.83927 16.5287 6.45836C15.4668 3.07743 12.3082 0.625 8.57682 0.625Z" stroke="currentColor" stroke-width="1.25"/>
      <path d="M1 1L17 12" stroke="currentColor" stroke-width="1.25"/>
    </svg>`;

  const addToggle = (input) => {
    if (!input) return;

    const wrapper = input.closest('.field') || input.parentElement;
    if (!wrapper || wrapper.querySelector('.password-toggle-button')) return;

    wrapper.classList.add('password-field-wrapper');

    // Show password on load
    input.type = 'text';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'password-toggle-button';

    // pressed=true => visible on load (open eye)
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Hide password');
    if (input.id) btn.setAttribute('aria-controls', input.id);

    btn.innerHTML = `
      <span class="visually-hidden">Hide password</span>
      ${showSvg}
      ${hideSvg}
    `;

    wrapper.appendChild(btn);

    btn.addEventListener('click', () => {
      const isVisible = input.type === 'text';

      // Toggle visibility
      input.type = isVisible ? 'password' : 'text';

      // pressed reflects the new state (true when visible)
      const nowVisible = !isVisible;
      btn.setAttribute('aria-pressed', String(nowVisible));

      const label = nowVisible ? 'Hide password' : 'Show password';
      btn.querySelector('.visually-hidden').textContent = label;
      btn.setAttribute('aria-label', label);

      input.focus({ preventScroll: true });
    });
  };

  addToggle(passwordInput);
  addToggle(confirmInput);

  /* ---------- Password match validation (unchanged) ---------- */

  if (passwordInput && confirmInput) {
    let errorEl = document.getElementById('RegisterForm-password-confirm-error');
    if (!errorEl) {
      const confirmWrapper = confirmInput.closest('.field') || confirmInput.parentElement;
      errorEl = document.createElement('small');
      errorEl.id = 'RegisterForm-password-confirm-error';
      errorEl.className = 'form__message';
      errorEl.style.display = 'none';
      if (confirmWrapper) confirmWrapper.insertAdjacentElement('afterend', errorEl);
    }

    const clearError = () => {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
      confirmInput.setCustomValidity('');
      confirmInput.removeAttribute('aria-invalid');
      confirmInput.removeAttribute('aria-describedby');
    };

    const showError = (msg) => {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      confirmInput.setCustomValidity(msg);
      confirmInput.setAttribute('aria-invalid', 'true');
      confirmInput.setAttribute('aria-describedby', errorEl.id);
    };

    const validateMatch = () => {
      if (confirmInput.value && passwordInput.value !== confirmInput.value) {
        showError('Passwords do not match.');
      } else {
        clearError();
      }
    };

    passwordInput.addEventListener('input', validateMatch);
    confirmInput.addEventListener('input', validateMatch);

    const form = passwordInput.form || confirmInput.form;
    if (form) {
      form.addEventListener(
        'submit',
        (e) => {
          if (passwordInput.value !== confirmInput.value) {
            e.preventDefault();
            e.stopImmediatePropagation();
            showError('Passwords do not match.');
            confirmInput.reportValidity();
            confirmInput.focus({ preventScroll: true });
          }
        },
        true
      );
    }
  }
});