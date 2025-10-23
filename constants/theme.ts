import { Platform } from 'react-native';

export const Colors = {
    text: '#dcdedf',
    background: '#151718',
    tint: '#0a7ea4',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#0a7ea4',
};

export const Fonts = Platform.select({
    ios: {
        mono: 'ui-monospace',
        serif: 'ui-serif',
    },
    default: {
        mono: 'monospace',
        serif: 'serif',
    },
    web: {
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        serif: "Georgia, 'Times New Roman', serif",
    },
});
