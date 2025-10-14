# 新寺院オンボーディング手順（SITES_ONBOARDING）

この手順に沿えば、雛形から新しい寺院サイトを短時間で立ち上げられます。

## 1. 寺院ディレクトリの作成
- `sites/<temple-id>/` を作成（例: `sites/tofukuji-soka/`）
- 配下に以下を用意
  - `site-config.json`（設定ファイル）
  - `images/`（ロゴ・ヒーロー・行事写真など）

## 2. 必要情報の収集
- 名称 / 宗派 / 住所 / 電話 / メール
- ドメイン（本番）・SNS
- メニュー構成（ホーム/ご案内/年間行事/資料館/お問い合わせ など）
- 代表写真（ロゴ/ヒーロー/境内）

## 3. EmailJS 設定
- 寺院ごとに公開キー・サービスID・テンプレID（Goma/Contact）を発行
- 許可ドメインに本番ドメインを登録
- テンプレのプレースホルダ：
  - 共通: `name`, `email`, `phone`, `submission_date`, `reply_to`, `kind`, `subject`
  - 備考: `remarks`, `{{{remarks_html}}}`
  - 護摩札: `{{{items_html}}}`（任意で `total_count`, `total_fee`）

## 4. site-config.json を作成
- スキーマは `docs/site-config.schema.json` を参照
- カラーは CSS 変数（`--primary-color` など）へ適用

## 5. ビルド/デプロイ
- 簡易運用：`template/` をそのままコピーし、`sites/<temple-id>/site-config.json` と `images/` を参照する形で公開
- Netlify → Deploys → Upload a folder（推奨）
  - フォルダ直下に `index.html` と `images/` が並ぶように
  - `netlify.toml` を同梱（/downloads → /downloads.html など）

## 6. 検証チェックリスト
- ルート200、`/images/...` 直リンク200
- `/downloads` → `/downloads.html` にリダイレクト
- Goma/Contact 送信：メールで表（`{{{items_html}}}`）と備考（`{{{remarks_html}}}`）が表示
- メニュー・住所・電話・メール・SNSが正しく反映

## 7. 品質・法務
- 画像・ロゴの利用許諾確認
- プライバシーポリシー/免責の記載
- OGP/ファビコン/サイトタイトル/description
