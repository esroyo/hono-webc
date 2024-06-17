export type HonoWebcOptions = {
    /**
     * Enables WebC Bundler Mode to aggregate CSS and JS found in WebC components.
     * Bundler mode is disabled by default.
     *
     * @link https://github.com/11ty/webc?tab=readme-ov-file#aggregating-css-and-js
     */
    bundle?: boolean;
    /**
     * Data to be passed to the WebC compilation.
     */
    data?: Record<string | number | symbol, any> | null | undefined;
    /**
     * - When passing in a glob string, the filename will be used as the
     * component name.
     * - When passing in an array of file names, the filenames will be used as
     * the component name.
     * - When passing in an object, the key will be used as the component name.
     *
     * @example
     * ```js
     * { defineComponents: "components/**.webc" }
     * ```
     *
     * @example
     * ```js
     * { defineComponents: ["components/my-component.webc"] }
     * ```
     *
     * @example
     * ```js
     * { defineComponents: { "my-component": "components/my-component.webc" } }
     * ```
     *
     * @link https://github.com/11ty/webc?tab=readme-ov-file#register-global-components
     */
    defineComponents?: string | string[] | Record<string, string>;
    /**
     * A file path for a webc file ("page.webc"), or an string of html/webc contents
     * (`<p>Hello!</p>`).
     */
    input?: string;
};
