import { d as PGliteInterface } from '../pglite-BPiZge4p.js';

declare const auto_explain: {
    name: string;
    setup: (_pg: PGliteInterface, _emscriptenOpts: any) => Promise<{
        bundlePath: URL;
    }>;
};

export { auto_explain };
