# 寺院サイト 雛形ガイド (Template Guide)

このガイドは、普門寺サイトをベースに他寺院へ転用できる雛形運用の手順をまとめたものです。

## 構成方針
- 共通コードは `template/` に配置（HTML, CSS, JS, netlify.toml）。
- 寺院ごとの固有情報と画像は `sites/<temple-id>/` に配置。
- 必要に応じて `dist/<temple-id>/` に出力し、Netlify へ「Upload a folder」で公開。

## ディレクトリ構成（例）
```
project-root/
  template/
    index.html
    downloads.html
    contact.html
    events.html
    guide.html
    museum.html
    styles.css
    script.js
    netlify.toml
  sites/
    sample-temple/
      site-config.json
      images/
    tofukuji-soka/
      site-config.json
      images/
  docs/
    TEMPLATE_GUIDE.md
    SITES_ONBOARDING.md
    site-config.schema.json
  dist/ (任意)
    tofukuji-soka/
```

## site-config.json とは
- 寺院名、住所、電話、メール、メニュー、配色、画像、EmailJSキー等を定義。
- スキーマは `docs/site-config.schema.json` を参照。

### 最小例
```json
{
  "name": "松寿山不動院 東福寺",
  "sect": "真言宗智山派",
  "address": "〒340-0012 埼玉県草加市神明１丁目３−４３",
  "phone": "048-922-3051",
  "email": "info.toufukuji@gmail.com",
  "navigation": [
    {"label": "ホーム", "path": "/"},
    {"label": "山内", "path": "/guide"},
    {"label": "年間行事", "path": "/events"},
    {"label": "彫刻", "path": "/museum"},
    {"label": "資料館", "path": "/museum"},
    {"label": "お問い合わせ", "path": "/contact"}
  ],
  "theme": {
    "primaryColor": "#6b4e2e",
    "accentColor": "#c4a26a"
  },
  "images": {
    "logo": "sites/tofukuji-soka/images/logo.png",
    "hero": "sites/tofukuji-soka/images/hero.jpg"
  },
  "emailjs": {
    "publicKey": "",
    "serviceId": "",
    "templateIdGoma": "",
    "templateIdContact": ""
  }
}
```

## 反映方法（最小フロー）
1) `sites/<temple-id>/site-config.json` を作成（または編集）
2) `sites/<temple-id>/images/` に画像を配置
3) `template/` の HTML/CSS/JS を共通として利用（`script.js` 側で site-config を読み込む実装に）
4) `dist/<temple-id>/` へコピー（またはテンプレ直をフォルダごとアップ）
5) Netlify → Deploys → Upload a folder で公開

## EmailJS の運用
- 寺院ごとに公開キー・サービスID・テンプレIDを新規発行し、許可ドメインに本番ドメインを登録。
- テンプレは以下プレースホルダを使用（例）：
  - 共通: `name`, `email`, `phone`, `submission_date`, `reply_to`, `kind`, `subject`
  - 備考: `remarks`, `{{{remarks_html}}}`
  - 護摩札: `{{{items_html}}}`（必要に応じ `total_count`, `total_fee`）
- Handlebars では HTMLは三重波括弧 `{{{...}}}` で非エスケープ表示。

## デプロイの注意
- Netlify は「サイト全体のスナップショット」を公開。差分アップは不可。
- 手動アップは「Upload a folder」が安全（階層ズレ回避）。
- ZIPでアップする際は、ZIP最上位に `index.html` と `images/` が直置きで存在すること。
