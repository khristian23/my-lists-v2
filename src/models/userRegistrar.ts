export default class UserRegistrar {
  name = '';
  email = '';
  password = '';
  confirmation = '';

  isEmailValid(): boolean {
    if (!this.email || this.email.length === 0) {
      throw new Error('Please enter an email');
    }

    const emailPattern =
      /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;

    if (!emailPattern.test(this.email)) {
      throw new Error('Invalid Email');
    }

    return true;
  }

  isPasswordValid(): boolean {
    if (!this.password && this.password.length === 0) {
      throw new Error('Please enter a password');
    }

    if (this.password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    return true;
  }

  isPasswordConfirmed(): boolean {
    if (this.password === this.confirmation) {
      throw new Error('Password confirmation does not match');
    }

    return true;
  }
}
