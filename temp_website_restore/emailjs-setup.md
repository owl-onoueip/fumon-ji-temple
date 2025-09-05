# EmailJS設定ガイド - 普門寺お問い合わせフォーム（STEP BY STEP）

このガイドでは、普門寺のお問い合わせフォームでEmailJSを設定する手順を詳しく説明します。

## 🚀 STEP 1: EmailJSアカウントの作成

### 1-1. EmailJS公式サイトにアクセス
1. ブラウザで https://www.emailjs.com/ を開く
2. 右上の「**Sign Up**」ボタンをクリック

### 1-2. アカウント情報を入力
1. **Email**: fumonji.info@gmail.com（または管理者のメールアドレス）
2. **Password**: 安全なパスワードを設定
3. **Confirm Password**: 同じパスワードを再入力
4. 「**Create Account**」をクリック

### 1-3. メール認証
1. 登録したメールアドレスに認証メールが届く
2. メール内の「**Verify Email**」リンクをクリック
3. EmailJSダッシュボードにログイン完了

---

## 📧 STEP 2: Gmailサービスの設定（初心者向け詳細ガイド）

### 2-1. サービス追加画面へアクセス
1. **EmailJSダッシュボード**にログイン後、画面上部のタブを確認
2. 「**Email Services**」タブをクリック（左から2番目のタブ）
3. 画面右上の青い「**Add New Service**」ボタンをクリック

![画面イメージ: Email Servicesタブ → Add New Serviceボタン]

### 2-2. Gmailサービスを選択
1. **サービス選択画面**が表示される
2. 多数のメールサービスが表示される中から「**Gmail**」を探してクリック
   - 赤いGmailアイコンが目印
   - 「Google Gmail」と表示されている場合もあります
3. Gmailを選択すると「**Connect Account**」ボタンが表示される
4. 「**Connect Account**」をクリック

### 2-3. Google認証プロセス（重要）
1. **新しいウィンドウ**でGoogleログイン画面が開く
2. **アカウント選択画面**で以下を確認：
   - 「fumonji.info@gmail.com」が表示されている場合 → そのアカウントをクリック
   - 表示されていない場合 → 「別のアカウントを使用」をクリックして手動入力
3. **パスワード入力**（必要に応じて）
4. **権限許可画面**が表示される：
   - 「EmailJSがGmailアカウントにアクセスすることを許可しますか？」
   - 内容を確認して「**許可**」または「**Allow**」をクリック
5. 認証完了後、**自動的にEmailJSダッシュボードに戻る**

⚠️ **注意**: ポップアップブロックが有効な場合、認証画面が表示されない場合があります

### 2-4. サービス設定の完了確認
1. EmailJSダッシュボードに戻ると、**サービス設定画面**が表示される
2. 以下の情報を確認：
   - **Service Name**: 「Gmail」または任意の名前を入力可能
   - **Service ID**: 自動生成される（例：`service_abc123xyz`）
   - **From Name**: 「普門寺お問い合わせフォーム」など任意の送信者名
   - **From Email**: 自動的に「fumonji.info@gmail.com」が設定される
3. **Service IDを必ずメモ**してください（後でJavaScriptファイルで使用）
4. 設定内容を確認後、「**Create Service**」ボタンをクリック
5. 「Service created successfully」などの成功メッセージが表示される

### 🔍 Service IDの場所（詳細説明）

**Service IDが見つからない場合の確認方法：**

**方法1: サービス作成直後の画面で確認**
- Gmail認証完了後の設定画面で、**Service ID**という項目を探す
- 通常は画面上部の基本情報欄に表示される
- `service_`で始まる文字列（例：`service_gmail_abc123`）

**方法2: Email Servicesページで確認**
1. 画面上部の「**Email Services**」タブをクリック
2. 作成したGmailサービスが**一覧表示**される
3. サービス名の下または横に**Service ID**が表示される
4. 表の「**Service ID**」列を確認

**方法3: サービスをクリックして詳細確認**
1. Email Servicesページで作成したGmailサービスを**クリック**
2. サービス詳細画面が開く
3. 画面上部に**Service ID**が大きく表示される

⚠️ **重要**: Service IDは`service_`で始まる英数字の組み合わせです

✅ **確認ポイント**: Email Servicesページに新しく作成したGmailサービスが表示されていることを確認

---

## 📝 STEP 3: メールテンプレートの作成（初心者向け詳細ガイド）

### 3-1. テンプレート作成画面へアクセス
1. EmailJSダッシュボード上部の「**Email Templates**」タブをクリック（左から3番目のタブ）
2. 画面右上の青い「**Create New Template**」ボタンをクリック
3. **新しいテンプレート作成画面**が表示される

### 3-2. テンプレート基本情報の入力
**画面上部の基本設定欄に以下を入力：**

1. **Template Name**（テンプレート名）:
   - 入力例: 「普門寺お問い合わせ」
   - 管理用の名前なので、わかりやすい名前を付ける

2. **From Name**（送信者名）:
   - 入力例: 「普門寺お問い合わせフォーム」
   - メール受信時に表示される送信者名

3. **Subject**（件名）:
   - 入力例: 「【普門寺】お問い合わせ - {{subject}}」
   - `{{subject}}`は自動的にフォームの件名に置き換わります

4. **Reply To**（返信先）:
   - 入力: `{{reply_to}}`
   - 問い合わせ者のメールアドレスが自動設定されます

5. **To Email**（宛先）:
   - 入力: `{{to_email}}`
   - JavaScriptで「fumonji.info@gmail.com」が自動設定されます

### 3-3. メール本文の詳細設定
**画面中央の大きなテキストエリア（Message欄）に以下をコピー＆ペースト：**

```
普門寺へのお問い合わせをいただき、ありがとうございます。

■ お客様情報
お名前: {{name}}
メールアドレス: {{email}}
お電話番号: {{phone}}

■ お問い合わせ内容
件名: {{subject}}
内容:
{{message}}

---
このメールは普門寺のお問い合わせフォームから自動送信されました。
内容を確認後、担当者よりご連絡いたします。

真言宗智山派 熊野山 普門寺
〒334-0076 埼玉県川口市本蓮1-12-27
TEL: 048-281-2210
```

⚠️ **重要**: `{{name}}`、`{{email}}`などの`{{}}`で囲まれた部分は**そのまま入力**してください。これらは自動的にフォームの内容に置き換わります。

### 3-4. テンプレート保存と確認
1. すべての入力が完了したら、画面下部の「**Save**」ボタンをクリック
2. 「Template saved successfully」などの成功メッセージが表示される
3. **Template IDが自動生成される**（例：`template_abc123xyz`）
4. **Template IDを必ずメモ**してください（後でJavaScriptファイルで使用）

### 3-5. 作成完了の確認
1. Email Templatesページに戻り、新しく作成したテンプレートが表示されることを確認
2. テンプレート名をクリックすると、設定内容を再確認・編集できます

✅ **確認ポイント**: Template IDが表示されていることを確認し、必ずメモを取る

---

## 🔑 STEP 4: Public Keyの確認（初心者向け詳細ガイド）

### 4-1. Account設定画面へアクセス
1. EmailJSダッシュボードの**左側メニュー**を確認
2. 「**Account**」をクリック（歯車アイコンが目印）
3. Account設定画面が表示される
4. 画面上部のタブから「**General**」タブを選択（通常は最初から選択されています）

### 4-2. Public Key取得の詳細手順
1. General画面を下にスクロールして「**Public Key**」セクションを探す
2. **Public Key**の値が表示されている（例：`user_abc123xyz456789`）
3. Public Keyの右側にある「**Copy**」ボタンをクリック
   - または、テキストを選択してCtrl+C（Windows）でコピー
4. **Public Keyを必ずメモ**してください（後でJavaScriptファイルで使用）

⚠️ **重要事項**:
- Public Keyは`user_`で始まる長い文字列です
- このキーは公開されても安全ですが、Private Keyは絶対に公開しないでください
- Public Keyは全てのEmailJS機能で共通して使用されます

✅ **確認ポイント**: Public Keyが正しくコピーされていることを確認（`user_`で始まっているか）

---

## 📋 STEP 5: 取得した3つのIDの整理

### 5-1. 必要な情報の確認
以下の3つの情報が揃っていることを確認してください：

1. **Public Key** (STEP 4で取得)
   - 形式: `user_xxxxxxxxxxxxxxxxx`
   - 場所: Account → General

2. **Service ID** (STEP 2で取得)
   - 形式: `service_xxxxxxxxx`
   - 場所: Email Services → 作成したGmailサービス

3. **Template ID** (STEP 3で取得)
   - 形式: `template_xxxxxxxxx`
   - 場所: Email Templates → 作成したテンプレート

### 5-2. IDの再確認方法
**Service IDを忘れた場合:**
1. Email Servicesタブをクリック
2. 作成したGmailサービスを確認
3. Service ID列に表示されている値をコピー

**Template IDを忘れた場合:**
1. Email Templatesタブをクリック
2. 作成したテンプレートを確認
3. Template ID列に表示されている値をコピー

**Public Keyを忘れた場合:**
1. Account → Generalで再確認

---

## 💻 STEP 5: JavaScriptファイルの更新

### 5-1. script.jsファイルを開く
現在のコード（235行目付近）：
```javascript
emailjs.init('YOUR_PUBLIC_KEY');
```

### 5-2. Public Keyを置き換え
```javascript
emailjs.init('user_xxxxxxxxxxxxxxx'); // ← STEP 4で取得したPublic Key
```

### 5-3. Service IDとTemplate IDを置き換え
現在のコード（262行目付近）：
```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

置き換え後：
```javascript
emailjs.send('service_xxxxxxx', 'template_xxxxxxx', templateParams)
// ↑ STEP 2のService ID    ↑ STEP 3のTemplate ID
```

## 2. EmailJSサービスの設定

### サービスの追加
1. EmailJSダッシュボードにログイン
2. 「Email Services」タブをクリック
3. 「Add New Service」をクリック
4. Gmail、Outlook、Yahoo等のメールプロバイダーを選択
5. 普門寺のメールアドレス（fumonji.info@gmail.com）でサービスを設定

### 推奨設定（Gmail使用の場合）
- **Service ID**: `service_fumonji` (任意の名前)
- **Email**: `fumonji.info@gmail.com`
- **App Password**: Gmailのアプリパスワードを生成して入力

## 3. EmailJSテンプレートの作成

### テンプレートの追加
1. 「Email Templates」タブをクリック
2. 「Create New Template」をクリック
3. 以下のテンプレート内容を設定：

```
件名: 【普門寺】お問い合わせ - {{subject}}

本文:
普門寺へのお問い合わせをいただき、ありがとうございます。

■ お客様情報
お名前: {{name}}
メールアドレス: {{email}}
お電話番号: {{phone}}

■ お問い合わせ内容
件名: {{subject}}
内容:
{{message}}

---
このメールは普門寺のお問い合わせフォームから自動送信されました。
内容を確認後、担当者よりご連絡いたします。

真言宗智山派 熊野山 普門寺
〒334-0076 埼玉県川口市本蓮1-12-27
TEL: 048-281-2210
```

### テンプレート設定
- **Template ID**: `template_fumonji_contact` (任意の名前)
- **From Name**: `普門寺お問い合わせフォーム`
- **To Email**: `{{to_email}}`
- **Reply To**: `{{reply_to}}`

## 4. JavaScriptファイルの更新

`script.js`ファイルの以下の部分を実際の値に置き換えてください：

```javascript
// EmailJS initialization
(function() {
    // あなたのEmailJS Public Keyに置き換え
    emailjs.init('YOUR_PUBLIC_KEY_HERE');
})();

// Contact form handler
function handleContactForm(e) {
    // ...
    
    // あなたのService IDとTemplate IDに置き換え
    emailjs.send('YOUR_SERVICE_ID_HERE', 'YOUR_TEMPLATE_ID_HERE', templateParams)
    // ...
}
```

### 置き換える値
1. **YOUR_PUBLIC_KEY_HERE** → EmailJSダッシュボードの「Account」→「General」で確認できるPublic Key
2. **YOUR_SERVICE_ID_HERE** → 作成したサービスのID（例：`service_fumonji`）
3. **YOUR_TEMPLATE_ID_HERE** → 作成したテンプレートのID（例：`template_fumonji_contact`）

## 5. 設定値の確認方法

### Public Keyの確認
1. EmailJSダッシュボード → 「Account」
2. 「General」タブ → 「Public Key」をコピー

### Service IDの確認
1. EmailJSダッシュボード → 「Email Services」
2. 作成したサービスの「Service ID」をコピー

### Template IDの確認
1. EmailJSダッシュボード → 「Email Templates」
2. 作成したテンプレートの「Template ID」をコピー

## 6. テスト方法

1. 設定完了後、お問い合わせフォームからテストメッセージを送信
2. EmailJSダッシュボードの「Logs」でメール送信状況を確認
3. 指定したメールアドレスにメールが届くことを確認

## 7. トラブルシューティング

### よくある問題と解決方法

**メールが送信されない場合:**
- Public Key、Service ID、Template IDが正しく設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認
- EmailJSの月間送信制限（無料プランは200通/月）を超えていないか確認

**メールが届かない場合:**
- スパムフォルダを確認
- メールプロバイダーの設定を確認
- EmailJSのLogsでメール送信が成功しているか確認

**フォームエラーが表示される場合:**
- 必須フィールドがすべて入力されているか確認
- プライバシーポリシーにチェックが入っているか確認
- インターネット接続を確認

## 8. セキュリティ注意事項

- Public Keyは公開されても問題ありませんが、Private Keyは絶対に公開しないでください
- EmailJSの管理画面へのアクセスは信頼できる人のみに限定してください
- 定期的にEmailJSのログを確認し、不審な送信がないかチェックしてください

## 9. 料金プラン

EmailJSの無料プランでは月間200通まで送信可能です。
普門寺のお問い合わせ量に応じて、必要に応じて有料プランへのアップグレードを検討してください。

---

設定に関してご不明な点がございましたら、EmailJSの公式ドキュメントをご参照いただくか、技術サポートにお問い合わせください。
