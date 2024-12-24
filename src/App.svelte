<script>
  import PasswordGenerator from './components/PasswordGenerator.svelte';
  import { theme } from './lib/stores/theme';
</script>

<div class="app" class:dark={$theme === 'dark'}>
  <main>
    <PasswordGenerator />
  </main>
</div>

<style>
  :global(:root) {
    /* Light theme */
    --light-bg: #f8f9fa;
    --light-surface-1: #ffffff;
    --light-surface-2: #f1f3f5;
    --light-surface-3: #e9ecef;
    --light-text-1: #212529;
    --light-text-2: #495057;
    --light-border: #dee2e6;
    --light-primary: #228be6;
    --light-primary-hover: #1c7ed6;
    
    /* Dark theme */
    --dark-bg: #1a1b1e;
    --dark-surface-1: #25262b;
    --dark-surface-2: #2c2e33;
    --dark-surface-3: #373a40;
    --dark-text-1: #f8f9fa;
    --dark-text-2: #ced4da;
    --dark-border: #373a40;
    --dark-primary: #339af0;
    --dark-primary-hover: #228be6;
  }

  .app {
    --bg: var(--light-bg);
    --surface-1: var(--light-surface-1);
    --surface-2: var(--light-surface-2);
    --surface-3: var(--light-surface-3);
    --text-1: var(--light-text-1);
    --text-2: var(--light-text-2);
    --border: var(--light-border);
    --primary: var(--light-primary);
    --primary-hover: var(--light-primary-hover);
  }

  .app.dark {
    --bg: var(--dark-bg);
    --surface-1: var(--dark-surface-1);
    --surface-2: var(--dark-surface-2);
    --surface-3: var(--dark-surface-3);
    --text-1: var(--dark-text-1);
    --text-2: var(--dark-text-2);
    --border: var(--dark-border);
    --primary: var(--dark-primary);
    --primary-hover: var(--dark-primary-hover);
  }

  .app {
    background-color: var(--bg);
    color: var(--text-1);
    transition: background-color 0.3s, color 0.3s;
  }

  main {
    background: var(--surface-1);
    min-height: 100vh;
  }
</style>
