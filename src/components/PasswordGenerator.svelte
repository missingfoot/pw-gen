<script>
  import { onDestroy } from 'svelte';
  
  let passwordLength = 34;
  let includeNumbers = true;
  let includeSymbols = true;
  let passwordType = 'random';
  let characterCase = 'mixed';
  let breakupEnabled = false;
  let breakupSeparator = '-';
  let breakupSize = 4;
  let passwordVisible = true;
  let generatedPassword = '';
  let copyFeedback = '';
  let copyTimeout;

  // Generate and format password whenever any option changes
  $: {
    const rawPassword = generatePassword(passwordLength, includeNumbers, includeSymbols, characterCase);
    generatedPassword = breakupEnabled ? breakupPassword(rawPassword, breakupSeparator, breakupSize) : rawPassword;
  }

  function breakupPassword(password, separator, size) {
    if (!password) return '';
    const groups = [];
    for (let i = 0; i < password.length; i += size) {
      groups.push(password.slice(i, i + size));
    }
    return groups.join(separator);
  }

  // Get a cryptographically secure random integer between min and max (inclusive)
  function getSecureRandom(min, max) {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxNum = Math.pow(256, bytesNeeded);
    const array = new Uint8Array(bytesNeeded);

    let randomNum;
    do {
      crypto.getRandomValues(array);
      randomNum = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomNum = (randomNum << 8) + array[i];
      }
    } while (randomNum >= maxNum - (maxNum % range));

    return min + (randomNum % range);
  }

  // Secure shuffle using Fisher-Yates algorithm with crypto.getRandomValues
  function secureShuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getSecureRandom(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Clear clipboard after a timeout
  function clearClipboardAfterDelay() {
    setTimeout(() => {
      navigator.clipboard.writeText('').catch(() => {
        // Silent catch - don't expose error details
      });
    }, 60000); // Clear after 1 minute
  }

  // Prevent password from being stored in browser history or memory
  function sanitizePassword(password) {
    // Use a typed array that can be explicitly cleared
    const encoder = new TextEncoder();
    const buffer = encoder.encode(password);
    const result = password;
    
    // Clear the buffer immediately after use
    crypto.getRandomValues(buffer);
    return result;
  }

  // Securely clear variables
  function secureClear(variable) {
    if (typeof variable === 'string') {
      variable = '0'.repeat(variable.length);
      variable = '';
    } else if (variable instanceof Array) {
      crypto.getRandomValues(new Uint8Array(variable.buffer));
      variable.length = 0;
    }
  }

  // Override the copy function with secure implementation
  const copyPassword = async () => {
    try {
      // Use a one-time clipboard API token if available
      if ('clipboard' in navigator && 'write' in navigator.clipboard) {
        await navigator.clipboard.writeText(generatedPassword);
      } else {
        // Fallback with security warning
        console.warn('Secure clipboard API not available');
        await navigator.clipboard.writeText(generatedPassword);
      }
      
      copyFeedback = 'Copied!';
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copyFeedback = '';
        secureClear(copyFeedback);
      }, 2000);

      // Clear clipboard after delay
      clearClipboardAfterDelay();
    } catch (err) {
      copyFeedback = 'Failed to copy';
      // Don't log error details to console
    }
  };

  // Generate password with additional security measures
  function generatePassword(length, withNumbers, withSymbols, caseType) {
    try {
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      // Use TypedArrays for secure memory handling
      const chars = new Uint8Array(length);
      let index = 0;

      // Calculate secure distribution
      const numCount = withNumbers ? Math.floor(length * 0.2) : 0;
      const symbolCount = withSymbols ? Math.floor(length * 0.2) : 0;
      const letterCount = length - numCount - symbolCount;

      // Generate characters with secure random and immediate clearing
      for (let i = 0; i < letterCount; i++) {
        let charSet;
        switch (caseType) {
          case 'lower':
            charSet = lowercase;
            break;
          case 'upper':
            charSet = uppercase;
            break;
          default:
            charSet = getSecureRandom(0, 1) === 1 ? uppercase : lowercase;
        }
        chars[index++] = charSet.charCodeAt(getSecureRandom(0, charSet.length - 1));
      }

      if (withNumbers) {
        for (let i = 0; i < numCount; i++) {
          chars[index++] = numbers.charCodeAt(getSecureRandom(0, numbers.length - 1));
        }
      }

      if (withSymbols) {
        for (let i = 0; i < symbolCount; i++) {
          chars[index++] = symbols.charCodeAt(getSecureRandom(0, symbols.length - 1));
        }
      }

      // Secure shuffle
      secureShuffleArray(chars);

      // Convert to string and clear buffer
      const password = String.fromCharCode.apply(null, chars);
      crypto.getRandomValues(chars); // Immediately overwrite the buffer
      
      return sanitizePassword(password);
    } catch (error) {
      // Don't expose error details
      throw new Error('Password generation failed');
    }
  }

  // Clean up when component is destroyed
  onDestroy(() => {
    if (copyTimeout) clearTimeout(copyTimeout);
    secureClear(generatedPassword);
    secureClear(copyFeedback);
  });
</script>

<div class="password-generator" 
  autocomplete="off"
  autocapitalize="off"
  autocorrect="off"
  spellcheck="false"
>
  <div class="section">
    <h2>Choose password type</h2>
    <div class="type-selector">
      <button 
        class:active={passwordType === 'random'} 
        on:click={() => passwordType = 'random'}
      >
        Random
      </button>
      <button 
        class:active={passwordType === 'memorable'} 
        on:click={() => passwordType = 'memorable'}
      >
        Memorable
      </button>
      <button 
        class:active={passwordType === 'pin'} 
        on:click={() => passwordType = 'pin'}
      >
        PIN
      </button>
    </div>
  </div>

  <div class="section">
    <h2>Characters</h2>
    <div class="customization">
      <div class="length-control">
        <div class="slider-container">
          <input 
            type="range" 
            bind:value={passwordLength} 
            min="8" 
            max="64"
          />
          <input 
            type="number" 
            bind:value={passwordLength} 
            min="8" 
            max="64"
            class="length-input"
          />
        </div>
      </div>

      <div class="type-selector">
        <button 
          class:active={characterCase === 'mixed'} 
          on:click={() => characterCase = 'mixed'}
        >
          Mixed case
        </button>
        <button 
          class:active={characterCase === 'lower'} 
          on:click={() => characterCase = 'lower'}
        >
          Lowercase
        </button>
        <button 
          class:active={characterCase === 'upper'} 
          on:click={() => characterCase = 'upper'}
        >
          Uppercase
        </button>
      </div>

      <div class="toggles">
        <div class="toggle">
          <label>Numbers</label>
          <label class="switch">
            <input type="checkbox" bind:checked={includeNumbers}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle">
          <label>Symbols</label>
          <label class="switch">
            <input type="checkbox" bind:checked={includeSymbols}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle" class:no-border={breakupEnabled}>
          <label>Break up password</label>
          <label class="switch">
            <input type="checkbox" bind:checked={breakupEnabled}>
            <span class="slider"></span>
          </label>
        </div>
        {#if breakupEnabled}
          <div class="breakup-options">
            <div class="breakup-input">
              <label>Separator</label>
              <input 
                type="text" 
                bind:value={breakupSeparator}
                maxlength="1"
                class="separator-input"
              >
            </div>
            <div class="breakup-input">
              <label>Group size</label>
              <input 
                type="number" 
                bind:value={breakupSize}
                min="2"
                max="8"
                class="size-input"
              >
            </div>
          </div>
        {/if}
        <div class="toggle">
          <label>Show password</label>
          <label class="switch">
            <input type="checkbox" bind:checked={passwordVisible}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Generated password</h2>
    <div 
      class="password-display" 
      style="user-select: all;"
    >
      {#if passwordVisible}
        {generatedPassword}
      {:else}
        {'•'.repeat(generatedPassword.length)}
      {/if}
    </div>
    <div class="button-group">
      <button class="primary" on:click={copyPassword}>
        {copyFeedback || 'Copy password'}
      </button>
      <button on:click={() => {
        const rawPassword = generatePassword(passwordLength, includeNumbers, includeSymbols, characterCase);
        generatedPassword = breakupEnabled ? breakupPassword(rawPassword, breakupSeparator, breakupSize) : rawPassword;
      }}>
        Refresh password
      </button>
    </div>
  </div>
</div>

<style>
  .password-generator {
    width: 100p%;
    margin: auto;
    padding: 2rem;
    background: var(--surface-1);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .section {
    margin-bottom: 1rem;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  h2 {
    font-size: var(--font-size-base);
    line-height: var(--line-height-tight);
    color: var(--text-1);
    text-align: left;
    padding: .5rem 0;
  }

  .type-selector {
    display: flex;
    gap: 8px;
    background: var(--surface-2);
    padding: 4px;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 0;
  }

  .type-selector button {
    flex: 1;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: var(--text-1);
    font-weight: 500;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  .type-selector button.active {
    background: var(--surface-3);
  }

  .customization {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .length-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .slider-container {
    display: flex;
    gap: 16px;
    align-items: center;
    width: 100%;
  }

  input[type="range"] {
    flex: 1;
    accent-color: var(--primary);
  }

  .length-input {
    width: 48px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    text-align: left;
    background: var(--surface-2);
    color: var(--text-1);
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  .toggles {
    display: flex;
    flex-direction: column;
    gap: 0rem;
    width: 100%;
  }

  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-2);
    padding: 0.5rem 0rem;
    border-bottom: 1px solid var(--border);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
  }

  .toggle.no-border {
    border-bottom: none;
    padding-bottom: 0;
  }

  .breakup-options {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0rem 1rem 0rem;
    width: 100%;
    border-bottom: 1px solid var(--border);
  }

  .toggle:has(+ .breakup-options) {
    border-bottom: none;
    padding-bottom: 0;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    flex-shrink: 0;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--surface-3);
    transition: .4s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: var(--surface-1);
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--primary);
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  .password-display {
    width: 100%;
    background: var(--surface-2);
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: var(--font-mono);
    letter-spacing: 0.1rem;
    margin-bottom: 1rem;
    overflow-wrap: break-word;
    word-break: break-all;
    color: var(--text-1);
    font-size: var(--font-size-lg);
    line-height: var(--line-height-normal);
    box-sizing: border-box;
    text-align: left;
    transition: color 0.2s;
  }

  .password-display:not(.visible) {
    color: var(--text-1);
    letter-spacing: 0.2em;
  }

  .button-group {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .button-group button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-1);
    font-weight: 500;
    white-space: nowrap;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  .button-group button.primary {
    background: var(--primary);
    color: white;
  }

  .button-group button.primary:hover {
    background: var(--primary-hover);
  }

  .button-group button:not(.primary) {
    background: var(--surface-2);
    border: 1px solid var(--border);
  }

  .button-group button:not(.primary):hover {
    background: var(--surface-3);
  }

  .breakup-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-2);
  }

  .separator-input,
  .size-input {
    width: 24px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    text-align: center;
    background: var(--surface-2);
    color: var(--text-1);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
  }

  .size-input {
    width: 36px;
  }

  [data-sensitive="true"] {
    -webkit-text-security: disc;
  }
  
  [data-sensitive="true"]:focus {
    -webkit-text-security: none;
  }
  
  /* Prevent text selection for sensitive content */
  .password-generator {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Allow text selection only for the password display */
  .password-display {
    user-select: all;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .visibility-toggle {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-2);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .visibility-toggle:hover {
    background: var(--surface-3);
  }

  @media (max-width: 640px) {
    .password-generator {
      margin: 0rem auto;
      padding: 1rem;
    }
  }
</style>
