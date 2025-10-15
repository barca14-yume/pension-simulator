# プロジェクト構造

## ディレクトリ構成

```
年金シミュレーター/
├── app/                      # Next.js App Router
│   ├── globals.css          # グローバルスタイル（Tailwind + カスタム）
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # メインページ（左右2カラム）
│
├── components/              # Reactコンポーネント
│   ├── Header.tsx          # ヘッダー（プリセット・営業モード・保存/共有）
│   ├── FormPanel.tsx       # 左パネル（入力フォーム・アコーディオン）
│   ├── ResultsTabs.tsx     # 右パネル（タブUI）
│   ├── KPICards.tsx        # KPIカード（3枚）
│   ├── Charts.tsx          # グラフ（資産・CF・Monte Carlo）
│   └── YearTable.tsx       # 年次推移テーブル
│
├── store/                   # Zustand状態管理
│   └── useSimulatorStore.ts # グローバルステート
│
├── lib/                     # ビジネスロジック
│   ├── finance.ts          # 財務計算エンジン
│   ├── montecarlo.ts       # Monte Carloシミュレーション
│   ├── format.ts           # 通貨・数値フォーマット
│   ├── export.ts           # CSV/JSONエクスポート
│   ├── urlState.ts         # URL状態管理
│   └── utils.ts            # ユーティリティ関数
│
├── types/                   # TypeScript型定義
│   └── index.ts            # 全型定義（Zod schema含む）
│
├── data/                    # マスターデータ
│   └── presets.ts          # プリセット定義（3種類）
│
├── __tests__/               # テスト
│   ├── finance.test.ts     # 財務計算テスト
│   ├── urlState.test.ts    # URL状態テスト
│   └── export.test.ts      # エクスポートテスト
│
├── config.ts                # システム設定・係数
├── package.json             # 依存関係
├── tsconfig.json            # TypeScript設定
├── tailwind.config.ts       # Tailwind設定
├── vitest.config.ts         # テスト設定
├── README.md                # メインドキュメント
├── QUICKSTART.md            # クイックスタート
└── PROJECT_STRUCTURE.md     # このファイル
```

## 主要ファイルの役割

### `/app/page.tsx`
- メインページコンポーネント
- 左右2カラムレイアウト
- 営業モードのクラス適用

### `/components/FormPanel.tsx`
- 8つのアコーディオンセクション
  1. 顧客情報
  2. ライフイベント
  3. 所得・積立
  4. 公的年金
  5. 遺族・障害
  6. 私的年金・保険
  7. 生活費
  8. 住宅
- 数値入力・スライダー・チェックボックス
- リアルタイムバリデーション

### `/components/ResultsTabs.tsx`
- 4つのタブ
  1. サマリー（KPI + グラフ）
  2. 年次推移（テーブル）
  3. 前提・係数（設定確認）
  4. エクスポート（CSV/JSON/印刷）

### `/lib/finance.ts`
- `calculateTimeline()`: 年次タイムライン計算
- `calculateKPIs()`: KPI計算
- `runSimulation()`: メイン計算エントリポイント
- `validateInputs()`: 入力バリデーション

### `/lib/montecarlo.ts`
- `runMonteCarloSimulation()`: 500回試行
- Box-Muller変換による正規分布生成
- パーセンタイル計算（10/25/50/75/90）
- 破綻確率計算

### `/store/useSimulatorStore.ts`
- Zustandストア
- 入力状態・計算結果・UI状態
- 自動計算トリガー（debounce 300ms）
- プリセット切り替え

### `/config.ts`
- システム全体の定数
- 公的年金開始年齢（65歳）
- 基礎年金満額（816,000円）
- Monte Carlo試行回数（500回）
- バリデーション閾値

### `/data/presets.ts`
- Conservative: リターン1.5%, インフレ1.0%
- Base: リターン3.0%, インフレ1.5%（デフォルト）
- Aggressive: リターン4.5%, インフレ2.0%

## データフロー

```
1. ユーザー入力
   ↓
2. FormPanel → setInputs()
   ↓
3. Zustand Store (debounce 300ms)
   ↓
4. calculate()
   ↓
5. lib/finance.ts
   ├─ calculateTimeline()
   ├─ calculateKPIs()
   └─ lib/montecarlo.ts (オプション)
   ↓
6. Store に結果保存
   ↓
7. ResultsTabs / KPICards / Charts で表示
```

## 計算フロー

### 年次計算（各年ごと）

```
1. 年齢・死亡判定
   ↓
2. 収入計算
   - 給与（現役時）
   - 公的年金（65歳〜）
   - 私的年金（指定年齢〜）
   ↓
3. 支出計算
   - 生活費
   - 育児費（子供22歳まで）
   - 住宅費（指定年齢まで）
   ↓
4. 純キャッシュフロー
   = 収入 - 支出 + 積立額
   ↓
5. 資産更新
   残高(t+1) = 残高(t) × (1 + リターン) + 純CF
   ↓
6. TimelineRow に記録
```

### KPI計算

```
1. 生涯受取合計
   = Σ(公的年金 + 私的年金)
   ↓
2. リタイア時資産状況
   = 退職時残高 + 退職後収入NPV - 退職後支出NPV
   ↓
3. 破綻確率（MC時）
   = 残高が0未満になった試行数 / 総試行数
```

## UI/UX設計

### レスポンシブ対応
- 3:2ディスプレイ（2160×1440, 1280×853）
- 最小タッチターゲット: 40×40px
- 入力フィールド高さ: 48px (h-12)

### アクセシビリティ
- キーボード操作（Tab/Shift+Tab/矢印キー）
- コントラスト比AA+
- ツールチップ（ホバー・長押し対応）

### 営業モード
- `sales-mode` クラス適用
- フォントサイズ拡大（text-lg → text-xl）
- 余白削減
- コントラスト強化（contrast-125）
- アニメーション無効化

### 印刷対応
- A4横向き最適化
- `.no-print` クラスで非表示要素
- `.print-break` でページ区切り
- 背景色・グラフを印刷

## 状態管理

### Zustand Store構造

```typescript
{
  // 入力
  inputs: SimulatorInputs,
  
  // 結果
  results: SimulationResults | null,
  
  // UI状態
  currentPreset: PresetName,
  salesMode: boolean,
  currencyUnit: 'man' | 'sen' | 'yen',
  enableMonteCarlo: boolean,
  isCalculating: boolean,
  
  // アクション
  setInputs(),
  setPreset(),
  setSalesMode(),
  setCurrencyUnit(),
  setEnableMonteCarlo(),
  calculate(),
  reset(),
  loadInputs(),
}
```

## エクスポート機能

### CSV形式
- ヘッダー: 年, 年齢, 収入, 年金, 支出, 残高 等
- カンマ区切り
- Excel互換

### JSON形式
```json
{
  "inputs": { /* 全入力データ */ },
  "timeline": [ /* 年次データ配列 */ ],
  "exportedAt": "2024-10-15T09:00:00.000Z"
}
```

### URL共有
- Base64エンコード
- クエリパラメータ `?settings=...`
- デコード失敗時はデフォルト値

## テスト戦略

### 単体テスト（Vitest）
- `finance.test.ts`: 計算ロジック
- `urlState.test.ts`: URL状態管理
- `export.test.ts`: エクスポート機能

### テストケース
1. 基本ケース（40歳→95歳、資産プラス）
2. 遺族年金（死亡時の一時金・遺族年金）
3. URL状態ラウンドトリップ
4. CSV/JSON列・データ検証
5. 子供費用（22歳まで）
6. 住宅ローン（指定年齢まで）

## パフォーマンス最適化

### 計算
- Debounce 300ms（入力変更後）
- Monte Carlo: Web Worker候補（未実装）
- メモ化（useMemo）でグラフデータ生成

### レンダリング
- 年次テーブル: 最初10年＋5年ごと表示
- グラフ: Recharts の ResponsiveContainer
- 営業モード: アニメーション無効化

## 拡張ポイント

### 機能追加候補
- [ ] PWA対応（オフライン動作）
- [ ] Web Worker（Monte Carlo並列化）
- [ ] 複数シナリオ比較
- [ ] PDF出力
- [ ] 税金・社会保険料の詳細計算
- [ ] 資産クラス別の配分設定

### カスタマイズポイント
- `/config.ts`: 係数調整
- `/data/presets.ts`: プリセット追加
- `/lib/finance.ts`: 計算ロジック変更
- `/app/globals.css`: デザイン調整
