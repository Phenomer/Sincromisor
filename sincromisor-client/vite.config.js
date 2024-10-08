import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import fs from 'fs';
import yaml from 'js-yaml';

function toLowerCaseKeys(arr) {
    return arr.map(obj => {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value])
        );
    });
}
const config = yaml.load(fs.readFileSync('../config.yml', 'utf-8'));

export default defineConfig({
    appType: 'mpa',
    server: {
        open: true,
    },
    plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'src/partials')
        })
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                simple: resolve(__dirname, 'simple.html'),
                single: resolve(__dirname, 'single.html'),
                double: resolve(__dirname, 'double.html'),
                glass: resolve(__dirname, 'glass.html'),
                character: resolve(__dirname, 'character.html'),
                character_glass: resolve(__dirname, 'character-glass.html')
            }
        }
    },
    define: {
        'import.meta.env.RTC_SERVER_URL': JSON.stringify(config['Worker']['Sincromisor'][0]['url']),
        'import.meta.env.RTC_ICE_SERVERS': JSON.stringify(toLowerCaseKeys(config['WebRTC']['RTCIceServers']))
    }
});
