<script>
    import { theme } from '../lib/stores/theme';
    
    function toggleTheme() {
        theme.update(current => current === 'light' ? 'dark' : 'light');
    }
</script>

<button class="theme-toggle" on:click={toggleTheme}>
    {#if $theme === 'light'}
        Dark mode
    {:else}
        Light mode
    {/if}
</button>

<style>
    .theme-toggle {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        border: none;
        background: var(--surface-2);
        color: var(--text-1);
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .theme-toggle:hover {
        background: var(--surface-3);
    }

    @media (max-width: 640px) {
        .theme-toggle {
            top: 0.5rem;
            right: 0.5rem;
        }
    }
</style>
