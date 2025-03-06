
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Version tracking
const versionFile = path.resolve(__dirname, '.version');
let currentVersion = '1.0.0';

// Read existing version if available
try {
  if (fs.existsSync(versionFile)) {
    currentVersion = fs.readFileSync(versionFile, 'utf-8').trim();
  } else {
    // Create initial version file if it doesn't exist
    fs.writeFileSync(versionFile, currentVersion);
  }
} catch (error) {
  console.warn('Error reading/writing version file:', error);
}

// Increment patch version for builds
const incrementVersion = () => {
  const parts = currentVersion.split('.').map(Number);
  parts[2] += 1;
  const newVersion = parts.join('.');
  try {
    fs.writeFileSync(versionFile, newVersion);
    console.log(`🔖 App version incremented to ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error('Error writing version file:', error);
    return currentVersion;
  }
};

// Ensure the version is available to the app
const updateVersionEnv = () => {
  const nextVersion = incrementVersion();
  try {
    fs.writeFileSync(
      path.resolve(__dirname, 'src/version.ts'),
      `// This file is auto-generated during builds\nexport const APP_VERSION = '${nextVersion}';\n`
    );
    console.log('✨ Version file updated successfully');
  } catch (error) {
    console.error('Error updating version.ts:', error);
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Only increment version in production builds
  if (mode === 'production') {
    updateVersionEnv();
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            shadcn: ['@radix-ui/react-select', '@radix-ui/react-dialog']
          }
        }
      }
    },
    define: {
      // Make version available as global constant
      __APP_VERSION__: JSON.stringify(currentVersion),
    }
  };
});
