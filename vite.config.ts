import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import minimist from 'minimist'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import livereload from 'rollup-plugin-livereload'
import zipPack from 'vite-plugin-zip-pack'
import fg from 'fast-glob'

// vite.config.js
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 解析命令行参数
const args = minimist(process.argv.slice(2))
// 判断是否为开发模式
const isWatch = args.watch || args.w || false
// 设置开发和生产环境的输出目录
const devDistDir = './dev'
const distDir = isWatch ? devDistDir : './dist'

// console.log('isWatch=>', isWatch)
// console.log('distDir=>', distDir)

export default defineConfig({
  // 配置路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 插件列表
  plugins: [
    // 自动导入插件
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 自动注册组件插件
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // Vue插件
    vue(),

    // 静态文件复制插件
    viteStaticCopy({
      targets: [
        {
          src: './README*.md',
          dest: './',
        },
        {
          src: './icon.png',
          dest: './',
        },
        {
          src: './preview.png',
          dest: './',
        },
        {
          src: './plugin.json',
          dest: './',
        },
        {
          src: './src/i18n/**',
          dest: './i18n/',
        },
        // {
        //   src: './src/assets/**',
        //   dest: './assets/',
        // },
      ],
    }),
  ],

  // https://github.com/vitejs/vite/issues/1930
  // https://vitejs.dev/guide/env-and-mode.html#env-files
  // https://github.com/vitejs/vite/discussions/3058#discussioncomment-2115319
  // 在这里自定义变量
  define: {
    'process.env.DEV_MODE': `"${isWatch}"`,
    'process.env': {},
  },

  // 构建配置
  build: {
    // 输出路径
    outDir: distDir,
    emptyOutDir: false,

    // 构建后是否生成 source map 文件
    sourcemap: false,

    // 设置为 false 可以禁用最小化混淆
    // 或是用来指定是应用哪种混淆器
    // boolean | 'terser' | 'esbuild'
    // 不压缩，用于调试
    minify: !isWatch,

    // 库模式配置
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      // the proper extensions will be added
      fileName: 'index',
      formats: ['cjs'],
    },
    // Rollup 配置
    rollupOptions: {
      plugins: [
        ...(isWatch
          ? [
              // 热更新插件
              livereload(devDistDir),
              {
                //监听静态资源文件
                name: 'watch-external',
                async buildStart() {
                  const files = await fg([
                    'src/i18n/*.json',
                    './README*.md',
                    './plugin.json',
                  ])
                  for (let file of files) {
                    this.addWatchFile(file)
                  }
                },
              },
            ]
          : [
              // 打包插件
              zipPack({
                inDir: './dist',
                outDir: './',
                outFileName: 'package.zip',
              }),
            ]),
      ],

      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['siyuan', 'process'],

      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css'
          }
          return assetInfo.name
        },
      },
    },
  },
})
