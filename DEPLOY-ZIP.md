# デプロイ手順（ZIP 手動アップロード / Netlify）

このドキュメントは、普門寺サイトを ZIP アップロードで公開更新するための手順をまとめた運用マニュアルです。対象ホスティングは Netlify（既存サイト）です。

---

## 構成確認
- プロジェクトルート: `c:\WINSURF\普門寺\`
- デプロイ用スクリプト: `make-deploy-folder.ps1`
- 公開に必要なファイル/フォルダ
  - `index.html, guide.html, events.html, museum.html, downloads.html, contact.html`
  - `styles.css, script.js, netlify.toml`
  - フォルダ: `images/`, `docs/`

---

## 1) デプロイ用フォルダの作成
更新作業後に、配信用のフォルダ（例: `deploy-YYYYMMDD-HHmm`）を生成します。

- PowerShell を起動し、以下を実行:
```powershell
Set-Location 'c:\WINSURF\普門寺'
.\nmake-deploy-folder.ps1 -OpenExplorer
```
- 完了すると `deploy-YYYYMMDD-HHmm/` が作成され、エクスプローラーが開きます。
- 同フォルダ直下に `index.html` や `downloads.html` があることを確認します。

> スクリプトは `images/` と `docs/` を再帰コピーします。`downloads.html` から参照している PDF は `docs/` に置いてください。

---

## 2) ZIP を作成（どちらかの方法）

### A. エクスプローラーで作成
1. `deploy-YYYYMMDD-HHmm` フォルダを右クリック
2. 「送る」→「圧縮 (zip 形式) フォルダー」
3. 生成された `deploy-YYYYMMDD-HHmm.zip` を控えます

### B. PowerShell で作成
```powershell
$src = 'c:\WINSURF\普門寺\deploy-YYYYMMDD-HHmm'
$dst = 'c:\WINSURF\普門寺\deploy-YYYYMMDD-HHmm.zip'
if (Test-Path $dst) { Remove-Item $dst -Force }
Compress-Archive -Path (Join-Path $src '*') -DestinationPath $dst
Write-Host "Created: $dst"
```

> 注意: 「フォルダの中身だけ」ではなく、「deploy-… フォルダ全体」を ZIP にするのが最も安全です。

---

## 3) Netlify に手動アップロード
1. Netlify にログインし、対象サイトを開く
2. 左メニュー「Deploys」をクリック
3. 画面内のドロップ領域に、次のいずれかをドラッグ＆ドロップ
   - `deploy-YYYYMMDD-HHmm` フォルダ
   - あるいは作成した `deploy-YYYYMMDD-HHmm.zip`
4. アップロード完了後、自動でビルド/公開が走ります
5. ステータスが `Published` になれば完了

---

## 4) 公開後の確認チェックリスト
- ルートページ（トップ）: 既存ドメイン（例: `https://www.fumon-ji.com/`）が表示される
- `downloads.html` の PDF リンク（`docs/` 配下）が正常に開ける
- オンライン申込の一連の流れ
  - 「確認へ」→ 確認モーダルの内容表示 → 「この内容で送信」
  - 成功メッセージに受付番号が出る
  - 「今回の申込内容を印刷する」ボタンで印刷プレビューが別タブで開く
- 画像・スタイルの欠けや崩れがない
- エラーがある場合は Netlify の
  - 「Deploys」→ 該当デプロイ → 「Logs」を確認

> 古いキャッシュが残る場合は、ブラウザでハードリロード（Windows: Ctrl + F5）を実施してください。

---

## 5) よくあるトラブルと対処
- ポップアップブロックで印刷プレビュー（別タブ）が開かない
  - ブラウザのアドレスバー付近の通知から、ポップアップを許可
- EmailJS の読み込みに失敗
  - ネットワークや拡張機能が CDN（jsdelivr.net）をブロックしていないか確認
- PDF が 404 になる
  - `docs/` フォルダに PDF が入っているか、`deploy-...` にコピーされているか確認
- 直後の再デプロイで変更が反映されない
  - `styles.css?v=...` と `script.js?v=...` の `v=` パラメータを更新してキャッシュ無効化（必要時）

---

## 6) ロールバック（以前の公開状態に戻す）
1. Netlify 「Deploys」から、戻したい履歴をクリック
2. 「Rollback to this deploy」を実行
3. ステータスが `Published` になれば切り戻し完了

---

## 7) 運用のコツ
- デプロイ単位でフォルダ名（`deploy-YYYYMMDD-HHmm`）を必ず変える
- 画像や PDF の更新は同じパスに差し替え（`images/` / `docs/`）
- 申込フローの仕様変更時は、`script.js` と `SECURITY-NOTES.md` の更新もセットで

---

## 付録: `make-deploy-folder.ps1` の仕様
- 生成: `deploy-YYYYMMDD-HHmm` フォルダ
- コピー対象:
  - `index.html, guide.html, events.html, museum.html, downloads.html, contact.html`
  - `styles.css, script.js, netlify.toml`
  - `images/`（再帰）
  - `docs/`（再帰）
- 実行例:
```powershell
Set-Location 'c:\WINSURF\普門寺'
.\nmake-deploy-folder.ps1 -OpenExplorer
```

---

以上で、ZIP 手動アップロードによる公開更新手順は完了です。運用で不明点や改善したい点が出てきたら、本マニュアルを更新してください。
