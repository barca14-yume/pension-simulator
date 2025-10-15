# デプロイメントガイド

## 本番ビルド

### 1. ビルド実行

```bash
npm run build
```

これにより `.next` ディレクトリに最適化されたビルドが生成されます。

### 2. ローカルで本番ビルドをテスト

```bash
npm run start
```

http://localhost:3000 でビルドされたアプリケーションが起動します。

## Vercelへのデプロイ

### 方法1: Vercel CLI

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

### 方法2: GitHub連携

1. GitHubリポジトリにプッシュ
2. Vercelダッシュボードで「New Project」
3. GitHubリポジトリを選択
4. 自動デプロイが開始

### 環境変数（必要に応じて）

Vercelダッシュボードで設定：
- 現時点では環境変数は不要
- 将来的にAPI連携する場合は追加

## Netlifyへのデプロイ

### 方法1: Netlify CLI

```bash
# Netlify CLIをインストール
npm i -g netlify-cli

# ビルド
npm run build

# デプロイ
netlify deploy --prod --dir=.next
```

### 方法2: GitHub連携

1. GitHubリポジトリにプッシュ
2. Netlifyダッシュボードで「New site from Git」
3. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `.next`

## 静的エクスポート（オプション）

Next.jsの静的エクスポート機能を使う場合：

### next.config.js を修正

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
```

### ビルド

```bash
npm run build
```

`out` ディレクトリに静的ファイルが生成されます。

### 注意事項

静的エクスポート時の制限：
- サーバーサイドレンダリング（SSR）不可
- API Routes不可
- 画像最適化の一部機能制限

本アプリは完全にクライアントサイドなので問題ありません。

## Dockerデプロイ

### Dockerfile作成

```dockerfile
FROM node:20-alpine AS base

# 依存関係のインストール
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 実行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### next.config.js に追加

```javascript
const nextConfig = {
  output: 'standalone',
  // ...
}
```

### ビルド・実行

```bash
docker build -t pension-simulator .
docker run -p 3000:3000 pension-simulator
```

## パフォーマンス最適化

### 1. 画像最適化

現在は画像を使用していませんが、将来追加する場合：
- Next.js の `<Image>` コンポーネントを使用
- WebP形式を優先

### 2. コード分割

- 自動的にページ単位で分割済み
- 大きなライブラリは動的インポート検討

### 3. キャッシュ戦略

- Vercel/Netlifyは自動的に最適なキャッシュを設定
- CDNエッジでの配信

### 4. 分析

```bash
# バンドルサイズ分析
npm install -D @next/bundle-analyzer

# next.config.js に追加
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# 実行
ANALYZE=true npm run build
```

## セキュリティ

### 1. 依存関係の監査

```bash
npm audit
npm audit fix
```

### 2. セキュリティヘッダー

`next.config.js` に追加：

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### 3. CSP（Content Security Policy）

厳格なCSPが必要な場合は設定を追加。

## モニタリング

### Vercel Analytics

```bash
npm install @vercel/analytics
```

`app/layout.tsx` に追加：

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### エラートラッキング（Sentry等）

必要に応じて導入。

## カスタムドメイン

### Vercel

1. Vercelダッシュボード → Settings → Domains
2. カスタムドメインを追加
3. DNS設定（A/CNAMEレコード）

### Netlify

1. Netlifyダッシュボード → Domain settings
2. カスタムドメインを追加
3. DNS設定

## 環境別設定

### 開発環境

```bash
npm run dev
```

### ステージング環境

Vercel/Netlifyでブランチごとに自動デプロイ：
- `main` ブランチ → 本番
- `develop` ブランチ → ステージング

### 本番環境

```bash
npm run build
npm run start
```

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュクリア
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### メモリ不足

```bash
# Node.jsのメモリ上限を増やす
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 型エラー

```bash
# 型チェック
npm run build
# または
npx tsc --noEmit
```

## チェックリスト

デプロイ前の確認事項：

- [ ] `npm run build` が成功する
- [ ] `npm test` が全て通る
- [ ] ブラウザで動作確認（Chrome, Safari, Edge）
- [ ] レスポンシブ表示確認（デスクトップ、タブレット）
- [ ] 印刷プレビュー確認
- [ ] エクスポート機能（CSV/JSON）確認
- [ ] URL共有機能確認
- [ ] 営業モード動作確認
- [ ] Monte Carloシミュレーション動作確認
- [ ] パフォーマンス確認（Lighthouse等）
- [ ] セキュリティヘッダー確認

## サポート

問題が発生した場合：
1. ビルドログを確認
2. ブラウザのコンソールを確認
3. GitHubのIssuesで報告
