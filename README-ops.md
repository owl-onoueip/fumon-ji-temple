# 運用ガイド（普門寺サイト）

このドキュメントは、静的Webサイト（HTML/CSS/JS）を安全に運用・拡張するための指針と手順をまとめたものです。

---

## 1. 原因と対策の要約（なぜ崩れるのか）

- ページ横断のスタイル干渉
  - 共通クラス（例: `.slideshow-container`）に強い指定を与えると、別ページにも波及します。
  - 対策: ページ専用 `body` クラスやセクション親クラスでスコープを限定。

- セレクタ優先度の競合
  - 後から追加した強いセレクタや `!important` が既存を上書き。
  - 対策: `!important` 連発を避け、セクション親＋ページスコープで優先度を構造的に上げる。

- 埋め込み動画の比率ボックス問題
  - Vimeo/YouTube の16:9比率ボックスが固定高さと競合し、空白が出る。
  - 対策: 外側コンテナの高さ固定に加え、内側 `div` と `iframe` を `height:100%` で上書き。

- キャッシュ混在
  - 古いCSS/JSが残って「直った/戻った」を繰り返す。
  - 対策: すべてのCSS/JS読込に `?v=YYYYMMDD-HHmm` を付与して更新。

---

## 2. ページ別スコープ方針（必須）

- `events.html` は `body.events-page-body`
- `museum.html` は `body.museum-page-body`
- `guide.html` は `body.guide-page-body`（必要に応じて付与）

ページ専用CSSは、かならず該当ページの `body` クラスやセクション親クラス配下に書きます。

例（良い例）:
```css
/* 年間行事ページの2列グリッド（992px以下で1列） */
.events-page-body .events-grid,
.events-section .events-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
}
@media (max-width: 992px) {
  .events-page-body .events-grid,
  .events-section .events-grid { grid-template-columns: 1fr; }
}

/* 資料館の動画/写真の高さ統一（PC300px/SP240px） */
.museum-slideshow .slideshow-container { height: 300px; }
@media (max-width: 768px) { .museum-slideshow .slideshow-container { height: 240px; } }
.segaki-records-section .video-section .video-container {
  height: 300px; margin: 0 !important; border-radius: 12px; overflow: hidden;
}
.segaki-records-section .video-section .video-container > div { padding: 0 !important; height: 100% !important; }
.segaki-records-section .video-section .video-container iframe { width: 100% !important; height: 100% !important; }
```

避ける例（悪い例）:
```css
/* 悪い: 全ページのスライドに高さ300pxを強制 */
.slideshow-container { height: 300px; }
```

---

## 3. JS 初期化の原則

- 機能は「コンテナ単位」で初期化
  - 例: スライドショーなら対象コンテナを取得して、その内側だけを操作。
- 付随DOM（ドット等）は「コンテナ内に生成」し、他ページに影響させない。
- 複数回初期化されないようガード（イベントやタイマーの重複防止）。

---

## 4. デプロイ手順（Netlify）

1) PowerShell で日時付きフォルダ作成
```powershell
Set-Location 'c:\WINSURF\普門寺'
.\u006d
```
もしくは:
```powershell
.\u006d -OpenExplorer
```
- スクリプト: `make-deploy-folder.ps1`
- 生成例: `deploy-20250907-0911/`
- 内容: `index.html`, `guide.html`, `events.html`, `museum.html`, `contact.html`, `styles.css`, `script.js`, `netlify.toml`, `images/`

2) Netlify の Deploys 画面へ、生成フォルダをドラッグ＆ドロップ

3) 反映確認（Ctrl+F5）
- `events.html?v=YYYYMMDD-HHmm`
- `museum.html?v=YYYYMMDD-HHmm`
- `guide.html?v=YYYYMMDD-HHmm`

---

## 5. 本番チェックリスト

- __TOP__
  - 永代供養カード: 画像1枚＋「詳細を見る」青ボタン。
- __ご案内（guide.html）__
  - 永代供養スライド: 横長・10秒切替・ドット表示/同期・説明文切替。
- __年間行事（events.html）__
  - 2列グリッド（PC）→992px以下で1列。
  - カードは「画像上＋本文下」。ボタンは青（`.details-toggle`）。
- __資料館（museum.html）__
  - 年度ごとに動画と写真が2列。高さ一致（PC300px/SP240px）。角丸・はみ出しなし。

---

## 6. トラブルシュート

- __崩れ発生時__
  - DevToolsで該当要素を選択 → `Styles`/`Computed` で「高さ・余白・overflow・position」を確認。
  - 取り消し線のCSSがあれば、どのセレクタが勝っているか確認。
  - 別ページのセレクタが当たっていれば、ページスコープで上書き（`body.XXX-page-body` やセクション親を付ける）。

- __動画の空白行__
  - 埋め込みの内側比率ボックスを上書き（`> div` と `iframe` に `height:100% !important; padding:0 !important;`）。

- __更新が反映されない__
  - `?v=YYYYMMDD-HHmm` を付けて読み込み。
  - DevToolsのNetworkで「Disable cache」をチェックして再読み込み。

---

## 7. コーディング規約（簡易）

- CSS命名は「ページスコープ + セクション親 + 要素」でユニークに。
- レイアウト系プロパティ（高さ・余白・overflow）は影響範囲が広いので、必ずスコープ化。
- 画像は `images/` に配置し、相対パスで参照。
- 変更点にはコメントで「影響ページ」を明記。

---

## 8. よくある追加依頼の落とし穴と回避

- 「他ページと同じ見た目に」
  - 同じクラスを流用せず、該当ページのスコープ配下で専用クラスを作成。
- 「高さだけサッと揃えて」
  - 動画埋め込みは内側要素まで上書きが必要。写真スライドと同寸に。
- 「直したのに戻った」
  - キャッシュかスコープ不足。`?v=` 付きURLで確認し、スコープ指定を見直す。

---

## 9. 連絡先・運用メモ

- デプロイ前後は各ページで `?v=` の更新状況を必ず確認。
- PowerShell スクリプト: `make-deploy-folder.ps1` を最優先で使用（日時付きフォルダ運用）。

---

以上。運用ガイドは適宜アップデートしてご利用ください。
