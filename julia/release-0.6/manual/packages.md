# パッケージ

Juliaには、Juliaで書かれたアドオン機能をインストールするためのパッケージマネージャが組み込まれています。 また、オペレーティングシステムの標準システムを使用して外部ライブラリをインストールすることも、ソースからコンパイルすることもできます。 登録されたJuliaパッケージのリストは、[http://pkg.julialang.org](http://pkg.julialang.org)にあります。 すべてのパッケージマネージャコマンドは、Juliaの`Base`インストールに含まれる`Pkg`モジュールにあります。

最初に、`Pkg`コマンドファミリの仕組みについて説明します。その後、パッケージを登録する方法についていくつかのガイダンスを提供します。 curated METADATAリポジトリにコードを追加する準備ができたら、パッケージ命名規則、バージョンのタグ付け、`REQUIRE`ファイルの重要性に関するセクションを必ず読んでください。

## パッケージのステータス

`Pkg.status()`関数は

```julia
julia> Pkg.status()
INFO: Initializing package repository /Users/stefan/.julia/v0.6
INFO: Cloning METADATA from git://github.com/JuliaLang/METADATA.jl
No packages installed.
```

パッケージディレクトリは、`Pkg`コマンドが最初に実行されるときに自動的に初期化されます.Pkgコマンドは、`Pkg.status()`を含みます。 ここには、必須でない追加のパッケージの例があります：

```julia
julia> Pkg.status()
Required packages:
 - Distributions                 0.2.8
 - SHA                           0.3.2
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.6
```

これらのパッケージはすべて`Pkg`で管理されている登録済みのバージョンです。 パッケージは、インストールされたパッケージのバージョンの右側に注釈が付いた、より複雑な状態になることがあります。 これらの状態やアノテーションが発生したときの説明をします。 プログラムによる使用の場合、`Pkg.installed()`は、インストールされているパッケージのバージョンにインストールされているパッケージ名をマッピングする辞書を返します。

```julia
julia> Pkg.installed()
Dict{String,VersionNumber} with 4 entries:
"Distributions"     => v"0.2.8"
"Stats"             => v"0.2.6"
"SHA"               => v"0.3.2"
"NumericExtensions" => v"0.2.17"
```

## パッケージの追加と取り除き

Juliaのパッケージマネージャーは、命令的ではなく宣言的であるという点で少し珍しいです。これは、あなたが望むものを教えて、それらの要件を最適かつ最小限に満たすためにどのバージョンをインストール（または削除）するかを決定することを意味します。したがって、パッケージをインストールするのではなく、要件のリストにパッケージを追加し、インストールする必要があるものを「解決」するだけです。特に、これは、以前のバージョンのパッケージで必要とされていたパッケージがインストールされていて、新しいバージョンにそのような要件がなくなっていると、実際にパッケージが削除されることを意味します。

あなたのパッケージ要件は`~/.julia/v0.6/REQUIRE`ファイルにあります。このファイルを手作業で編集し、`Pkg.resolve()`を呼び出してパッケージをインストール、アップグレード、または削除して、要件を最適に満たすようにするか、エディタで`REQUIRE`を開く`Pkg.edit()`を実行できます（`EDITOR`または`VISUAL`環境変数）、必要に応じて`Pkg.resolve()`を自動的に呼び出します。単一のパッケージに対する要件のみを追加または削除する場合は、非対話型の`Pkg.add()`および`Pkg.rm()`コマンドを使用することもできます。これらのコマンドは`REQUIRE`に単一の要件を追加または削除してから`Pkg.resolve()`を呼び出します。

`Pkg.add()`関数を使用して要件リストにパッケージを追加すると、それに依存するパッケージとすべてのパッケージがインストールされます。

```julia
julia> Pkg.status()
No packages installed.

julia> Pkg.add("Distributions")
INFO: Cloning cache of Distributions from git://github.com/JuliaStats/Distributions.jl.git
INFO: Cloning cache of NumericExtensions from git://github.com/lindahua/NumericExtensions.jl.git
INFO: Cloning cache of Stats from git://github.com/JuliaStats/Stats.jl.git
INFO: Installing Distributions v0.2.7
INFO: Installing NumericExtensions v0.2.17
INFO: Installing Stats v0.2.6
INFO: REQUIRE updated.

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.7
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.6
```

これがやっていることは`~/.julia/v0.6/REQUIRE`ファイルにまず`Distributions`を追加することです：

```bash
$ cat ~/.julia/v0.6/REQUIRE
Distributions
```

次に、これらの新しい要件を使用して`Pkg.resolve()`を実行すると、`Distributions`パッケージは必須であるがインストールされていないためインストールする必要があるという結論に至ります。 前述のように、`~/.julia/v0.6/REQUIRE`ファイルを手動で編集し、`Pkg.resolve()`を自分で実行することで、同じことを達成できます。

```julia
$ echo SHA >> ~/.julia/v0.6/REQUIRE

julia> Pkg.resolve()
INFO: Cloning cache of SHA from git://github.com/staticfloat/SHA.jl.git
INFO: Installing SHA v0.3.2

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.7
 - SHA                           0.3.2
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.6
```

これは、`Pkg.add("SHA")`の呼び出しと機能的に同等ですが、`Pkg.add()`はインストールが完了するまで`REQUIRE`を変更しないので、問題がある場合は`Pkg.add()`を呼び出す前に`REQUIRE`が残されます。`REQUIRE`ファイルのフォーマットについては、「要件の仕様」を参照してください。 パッケージのバージョンの特定の範囲を必要とするものがあります。

これ以上パッケージを使用したくない場合は、`Pkg.rm()`を使用して`REQUIRE`ファイルからパッケージの要件を削除します。

```julia
julia> Pkg.rm("Distributions")
INFO: Removing Distributions v0.2.7
INFO: Removing Stats v0.2.6
INFO: Removing NumericExtensions v0.2.17
INFO: REQUIRE updated.

julia> Pkg.status()
Required packages:
 - SHA                           0.3.2

julia> Pkg.rm("SHA")
INFO: Removing SHA v0.3.2
INFO: REQUIRE updated.

julia> Pkg.status()
No packages installed.
```

再度、`REQUIRE`ファイルを編集して各パッケージ名の行を削除し、`Pkg.resolve()`を実行して、インストールされたパッケージのセットを更新して一致させることと同じです。 `Pkg.add()`と`Pkg.rm()`は、単一のパッケージに対する要件の追加と削除に便利ですが、複数のパッケージを追加または削除する場合は、`Pkg.edit()`を呼び出して`REQUIRE`の内容を手動で変更し、それに応じてパッケージを更新します。 `Pkg.resolve()`が失敗した場合、`Pkg.edit()`は`REQUIRE`の内容をロールバックしません。`Pkg.edit()`を再度実行してファイルの内容を修正する必要があります。

パッケージマネージャはlibgit2を内部的に使用してパッケージgitリポジトリを管理するため、`Pkg.add()`を実行しているときにプロトコルの問題（たとえばファイアウォールの背後にある場合）が発生する可能性があります。デフォルトでは、GitHubでホストされているすべてのパッケージは 'https'を介してアクセスされます。このデフォルトは、`Pkg.setprotocol!()`を呼び出すことによって変更できます。次のコマンドはコマンドラインから実行して、gitがホストされている場所であれば、すべてのリポジトリを複製するときに 'git'プロトコルの代わりに 'https'を使用するように指示できます。

```julia
git config --global url."https://".insteadOf git://
```

ただし、この変更はシステム全体に適用されるため、`Pkg.setprotocol!()`の使用が推奨されます。

注意

また、パッケージマネージャー関数は、パッケージ名に.jlサフィックスを受け入れますが、サフィックスは内部的に取り除かれます。 例えば：

```julia
Pkg.add("Distributions.jl")
Pkg.rm("Distributions.jl")
```

## パッケージのオフラインインストール

インターネットに接続されていないマシンでは、同じオペレーティングシステムと環境を持つマシンからパッケージルートディレクトリ（`Pkg.dir()`で指定）をコピーしてパッケージをインストールすることができます。

`Pkg.add()`はパッケージのルートディレクトリ内で次の処理を行います。

1.  `REQUIRE`にパッケージの名前を追加する。
2.  パッケージを`.cache`にダウンロードし、パッケージをパッケージルートディレクトリにコピーする。
3.  パッケージの`REQUIRE`ファイルにリストされているすべてのパッケージに対して、ステップ2を繰り返し実行します。
4.  `Pkg.build()`を実行する。

警告

インストールされたパッケージを別のマシンからコピーすることは、バイナリの外部依存関係を必要とするパッケージに対しては脆弱です。 このようなパッケージは、オペレーティングシステムのバージョン、ビルド環境、および/または絶対パスの依存関係の違いにより、破損することがあります。

## 登録されていないパッケージをインストールする

Juliaパッケージは単にgitリポジトリであり、gitがサポートするプロトコルのいずれかを介してクローン可能であり、特定のレイアウト規則に従うJuliaコードを含んでいます。 公式のJuliaパッケージは、METADATA.jlリポジトリに登録されており、よく知られている場所[1]から入手できます。 前のセクションの`Pkg.add()`と`Pkg.rm()`コマンドは登録されたパッケージとやりとりしますが、パッケージマネージャーは未登録のパッケージをインストールして使用することもできます。 未登録のパッケージをインストールするには、`Pkg.clone(url)`を使います。ここで、`url`はパッケージをクローンできるgit URLです。

```julia
julia> Pkg.clone("git://example.com/path/to/Package.jl.git")
INFO: Cloning Package from git://example.com/path/to/Package.jl.git
Cloning into 'Package'...
remote: Counting objects: 22, done.
remote: Compressing objects: 100% (10/10), done.
remote: Total 22 (delta 8), reused 22 (delta 8)
Receiving objects: 100% (22/22), 2.64 KiB, done.
Resolving deltas: 100% (8/8), done.
```

習慣的に、Juliaリポジトリ名は`.jl`で終わります（追加の`.git`は「裸のgitリポジトリ」を示します）。これにより、他の言語のリポジトリと衝突することがなくなり、検索エンジンでJuliaパッケージを簡単に見つけることができます。 ただし、パッケージが`.julia/v0.6`ディレクトリにインストールされている場合、拡張子は冗長なので、そのまま残しておきます。

登録されていないパッケージにソースツリーの一番上に`REQUIRE`ファイルが含まれている場合、そのファイルは登録されていないパッケージが依存する登録パッケージを決定するために使用され、自動的にインストールされます。 登録されていないパッケージは、登録されたパッケージと同じバージョン解決ロジックに参加するため、インストールされたパッケージのバージョンは、登録済みパッケージと未登録パッケージの両方の要件を満たすために必要に応じて調整されます。

[1]
パッケージの公式パッケージはhttps://github.com/JuliaLang/METADATA.jlですが、個人や組織は簡単に別のメタデータリポジトリを使用できます。 これにより、どのパッケージを自動インストールできるかを制御することができます。 監査され承認されたパッケージバージョンのみを許可し、プライベートパッケージまたはフォークを利用可能にすることができます。 詳細については、カスタムMETADATAリポジトリを参照してください。

## パッケージのアップデート

パッケージ開発者があなたが使用しているパッケージの新しい登録バージョンを公開するとき、あなたはもちろん、新しい光沢のあるバージョンが必要です。 すべてのパッケージの最新版と最高バージョンを入手するには、`Pkg.update()`を実行してください：

```julia
julia> Pkg.update()
INFO: Updating METADATA...
INFO: Computing changes...
INFO: Upgrading Distributions: v0.2.8 => v0.2.10
INFO: Upgrading Stats: v0.2.7 => v0.2.8
```

パッケージを更新する最初のステップは、`~/.julia/v0.6/METADATA`に新しい変更を加えて、新しい登録パッケージバージョンが公開されているかどうかを確認することです。 この後、`Pkg.update()`はブランチ上でチェックアウトされたパッケージを更新しようとします。パッケージのアップストリームリポジトリから変更を取り込むことで、ダーティではありません（gitで追跡されるファイルは変更されません）。 アップストリームの変更は、マージまたはリベースが必要ない場合、つまりブランチが「早送り」できる場合にのみ適用されます。 ブランチが早送りできない場合は、作業中であるとみなされ、自分でリポジトリを更新します。

最後に、更新プロセスは、最上位レベルの要件と「固定」パッケージの要件を満たすためにインストールされた最適なパッケージバージョンのセットを再計算します。 パッケージが以下のいずれかである場合、パッケージは修正済みと見なされます。

1.  登録されていません：パッケージは`METADATA`にありません。`Pkg.clone()`でパッケージをインストールしました。
2.  チェックアウト：パッケージレポは開発ブランチにあります。
3.  Dirty:リポジトリ内のファイルが変更されました。

これらのいずれかが該当する場合、パッケージマネージャはパッケージのインストールされているバージョンを自由に変更することができないため、パッケージの他のパッケージバージョンによってその要件を満たす必要があります。`~/.julia/v0.6/REQUIRE`の最上位レベルの要件と固定パッケージの要件の組み合わせを使用して、何をインストールする必要があるかを判断します。

また、`Pkg.update`関数に引数を渡して、インストールされているパッケージのサブセットのみを更新することもできます。 その場合、引数として提供されるパッケージとその依存関係のみが更新されます：

```julia
julia> Pkg.update("Example")
INFO: Updating METADATA...
INFO: Computing changes...
INFO: Upgrading Example: v0.4.0 => 0.4.1
```

この部分的更新プロセスでは、トップレベルの要件と「固定」パッケージに従って新しいバージョンのパッケージ・バージョンが計算されますが、明示的に提供されるもの以外のすべてのパッケージとその依存関係は修正されています。

## Checkout, Pin and Free

登録されたバージョンではなく、`master`バージョンのパッケージを使用したい場合があります。 登録済みのバージョンでまだ公開されていない、必要な`master`に関する修正や機能があるか、パッケージの開発者であり、`master`やその他の開発ブランチで変更が必要な場合があります。 このような場合は、`Pkg.checkout(pkg)`を実行して、pkgまたは`Pkg.checkout(pkg, branch)`のマスターブランチをチェックアウトして、他のブランチをチェックアウトすることができます。

```julia
julia> Pkg.add("Distributions")
INFO: Installing Distributions v0.2.9
INFO: Installing NumericExtensions v0.2.17
INFO: Installing Stats v0.2.7
INFO: REQUIRE updated.

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.9
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.7

julia> Pkg.checkout("Distributions")
INFO: Checking out Distributions master...
INFO: No packages to install, update or remove.

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.9+             master
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.7
```

`Pkg.add()`を使用して`Distribution`をインストールした直後は、これを書いた時点で最新の登録済みバージョン - `0.2.9`になります。 `Pkg.checkout("Distribution")`を実行した後、`Pkg.statu()`の出力から、`Distributions`が`0.2.9`より大きい未登録のバージョンにあり、 "pseudo-version"の番号`0.2.9+` 。

未登録のパッケージをチェックアウトするときは、パッケージレポの`REQUIRE`ファイルのコピーが`METADATA`に登録されている要件よりも優先されるため、開発者はこのファイルを正確かつ最新の状態に保つことが重要です現在のバージョンのパッケージのパッケージリポジトリ内の`REQUIRE`ファイルが不正確または不足している場合、パッケージがチェックアウトされるときに依存関係が削除されることがあります。このファイルは、`Pkg`が提供するAPI（後述）を使用している場合に、新しく公開されたバージョンのパッケージを移植するためにも使用されます。

ブランチでパッケージをチェックアウトする必要がなくなったら、`Pkg.free(pkg)`を使ってパッケージマネージャのコントロールに "解放"することができます：

```julia
julia> Pkg.free("Distributions")
INFO: Freeing Distributions...
INFO: No packages to install, update or remove.

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.9
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.7
```

その後、パッケージはブランチ上ではなく登録バージョン上にあるので、パッケージの新しい登録バージョンが公開されるとそのバージョンが更新されます。

`Pkg.update()`を呼び出すことでパッケージのバージョンが変更されないように特定のバージョンでパッケージを固定する場合は、`Pkg.pin()`関数を使用できます。

```julia
julia> Pkg.pin("Stats")
INFO: Creating Stats branch pinned.47c198b1.tmp

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.9
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.7              pinned.47c198b1.tmp
```

この後、`Stats`パッケージはバージョン`0.2.7`で固定されたままになります - より具体的には、コミット`47c198b1`で固定されますが、バージョンは永続的に特定のgitハッシュに関連付けられているので、これは同じことです。 `Pkg.pin()`は、パッケージをピン止めし、そのブランチをチェックするコミットのスローアウェイブランチを作成することによって動作します。 デフォルトでは、現在のコミット時にパッケージを固定しますが、2つ目の引数を渡して別のバージョンを選択することもできます。

```julia
julia> Pkg.pin("Stats",v"0.2.5")
INFO: Creating Stats branch pinned.1fd0983b.tmp
INFO: No packages to install, update or remove.

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.9
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.5              pinned.1fd0983b.tmp
```

これで、`Stats`パッケージはコミット`1fd0983b`に固定され、バージョン`0.2.5`に対応します。 パッケージを「固定解除」してパッケージマネージャに再度更新させる場合は、ブランチから移動する場合のように`Pkg.free()`を使用できます。

```julia
julia> Pkg.free("Stats")
INFO: Freeing Stats...
INFO: No packages to install, update or remove.

julia> Pkg.status()
Required packages:
 - Distributions                 0.2.9
Additional packages:
 - NumericExtensions             0.2.17
 - Stats                         0.2.7
```

その後、`Stats`パッケージはパッケージマネージャによって再度管理され、`Pkg.update()`への今後の呼び出しによって、パブリッシュ時に新しいバージョンにアップグレードされます。 スローアウェイ`pinned.1fd0983b.tmp`ブランチはローカルの`Stats`リポジトリに残っていますが、gitブランチは非常に軽量なので、これは問題ではありません。 あなたがそれらを掃除したいと思えば、あなたはレポに行き、それらのブランチを削除することができます[2]。

[2]
リポジトリに変更を加えるとブランチにないパッケージもダーティとマークされますが、これはあまり一般的ではありません。

## Custom METADATA Repository

デフォルトでは、Juliaはパッケージのダウンロードとインストールのために公式のMETADATA.jlリポジトリを使用することを前提としています。別のメタデータリポジトリの場所を指定することもできます。一般的なアプローチは、Juliaの公式ブランチで`metadata-v2`ブランチを最新の状態に保ち、カスタムパッケージと共に別のブランチを追加することです。そのカスタムロケーションとブランチを使用してローカルメタデータリポジトリを初期化し、公式の`metadata-v2`ブランチでカスタムブランチを定期的にリベースすることができます。カスタムリポジトリとブランチを使用するには、次のコマンドを発行します。

```julia
julia> Pkg.init("https://me.example.com/METADATA.jl.git", "branch")
```

分岐引数はオプションで、デフォルトは`metadata-v2`です。初期化されると、`~/.julia/vX.Y/`パスにある`META_BRANCH`という名前のファイルが、METADATAリポジトリが初期化されたブランチを追跡します。ブランチを変更する場合は、`META_BRANCH`ファイルを直接変更するか（注意してください）、`vX.Y`ディレクトリを削除し、`Pkg.init`コマンドを使用してMETADATAリポジトリを再初期化する必要があります。

# パッケージの開発

Juliaのパッケージマネージャーは、パッケージがインストールされているときに、そのソースコードと完全な開発履歴を見ることができるように設計されています。 また、パッケージを変更したり、gitを使ってコミットしたり、アップストリームの修正や拡張を簡単に行うこともできます。 同様に、システムは、新しいパッケージを作成する場合、パッケージマネージャによって提供されるインフラストラクチャの中で、最も簡単な方法でパッケージを作成できるように設計されています。

## 最初の設定

＊＊＊＊＊＊

## 既にあるパッケージを変更する

### ドキュメンテーションの変更

### コードの変更

#### Executive summary

#### 詳細の記述

バグを修正したり、新しい機能を追加したりする場合は、変更内容を検討のために提出する前にテストすることができます。 また、パッケージのオーナーのフィードバックに応じて、簡単に提案を更新する必要があります。 したがって、この場合、戦略は自分のマシン上でローカルに作業することです。 変更に満足したら、検討のために提出します。 このプロセスはプルリクエストと呼ばれ、変更をプロジェクトのメインリポジトリに「プル」することを要求しています。 オンラインリポジトリはプライベートマシン上のコードを見ることができないため、変更を自分の個人的なGitHubアカウントでホストされているパッケージのオンラインフォークである公開された場所にプッシュします。

既に`Foo`パッケージがインストールされていると仮定しましょう。 以下の説明では、`Pkg`または`PkgDev`で始まるもの全てはJuliaプロンプトで入力することを意味します。 gitで始まるもの全ては、Juliaのシェルモードで（またはオペレーティングシステムに付属のシェルを使って）入力することを意図しています。 Julia内では、次の2つのモードを組み合わせることができます。

```julia
julia> cd(Pkg.dir("Foo"))          # go to Foo's folder

shell> git command arguments...    # command will apply to Foo
```

`Foo`にいくつかの変更を加える準備が整ったとします。 いくつかのアプローチがありますが、ここでは広く使用されています。

-   Juliaプロンプトで、`Pkg.checkout("Foo")`と入力します。 これにより、あなたがインストールした "公式リリース"のバージョンではなく、最新のコード（`master`ブランチ）を確実に実行します。 （バグの修正を計画している場合は、この時点でもう一度他の人がバグを修正したかどうかを再度確認することをお勧めします。もしあれば、新しい公式リリースにタグを付けて コミュニティの他の人に配布されます）。`Foo is dirty, bailing`エラーが発生した場合は、以下の[Dirtyパッケージ](./packages/#Dirty-packages-1)を参照してください。

-   変更のためのブランチを作成します：パッケージフォルダ（JuliaがPkg.dir（ "Foo"）から報告するもの）と（シェルモードで）`git checkout -b <newbranch>`を使って新しいブランチを作成します。ここで`<newbranch >`は説明的な名前（`fixbar`など）かもしれません。 ブランチを作成することで、新しい作業と現在のマスターブランチ間を容易に行き来することができます（[https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)を見てください）。

    既に変更を加えてからこの手順を忘れてしまった場合は、心配する必要はありません。下記の分岐の詳細を参照してください。

-   変更を加えます。 バグを修正しているか新しい機能を追加しているかにかかわらず、ほとんどの場合、変更にはsrc /とtest / foldersの両方の更新が含まれていなければなりません。 バグを修正する場合は、バグを示す最小限の例（現在のコード上）をテストスイートに追加してください。 バグのテストに参加することで、他の変更のためにバグが後で偶然に再び現れないようにすることができます。 新しい機能を追加する場合、テストを作成することにより、パッケージ所有者はコードが意図したとおりに機能することを確認したことを実証します。

-   パッケージのテストを実行し、テストが合格することを確認します。 テストを実行するにはいくつかの方法があります。

    -   Juliaから、`Pkg.test("Foo")`を実行します。これは別の（新しい）`julia`プロセスでテストを実行します。
    -   Juliaから、パッケージの`test/`フォルダから`include("runtests.jl")`として読み込みます（ファイル名が異なる可能性があります。すべてのテストを実行するファイルを探します）。これにより、テストは同じセッションで繰り返し実行されます。 すべてのパッケージコードをリロードします。 ロードに時間がかかるパッケージの場合、これははるかに高速になる可能性があります。 このアプローチでは、パッケージコードを変更するために余分な作業をする必要があります。
    -   シェルから、パッケージの`src/`フォルダー内から`julia ../test/runtests.jl`を実行します。

-   変更をコミットしてください：https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repositoryを参照してください。

-   変更を送信します。Juliaプロンプトで、PkgDev.submit（ "Foo"）と入力します。 これにより、GitHubフォークに変更がプッシュされ、まだ存在しない場合は作成されます。 （エラーが発生した場合は、SSHキーが設定されていることを確認してください。）Juliaがハイパーリンクを表示します。 そのリンクを開き、メッセージを編集して、[送信]をクリックします。 その時点で、パッケージ所有者に変更が通知され、ディスカッションが開始されます。 （gitに慣れている場合は、シェルからこれらの手順を手動で実行することもできます）。

-   パッケージ所有者は、さらに改善を提案するかもしれません。 これらの提案に応答するには、プルリクエストを簡単に更新することができます（これはマージされていない変更に対してのみ機能します）。マージされたプルリクエストに対しては、新しいブランチを開始して新しい変更を行います。

    -   その間にブランチを変更した場合は、git checkout fixbar（シェルモードから）またはPkg.checkout（ "Foo"、 "fixbar"）（Juliaプロンプトから）を使って同じブランチに戻ってください。
    -   上記のように、変更を行い、テストを実行し、変更をコミットします。
    -   シェルから「git push」と入力します。 これにより、新しいコミットが同じプルリクエストに追加されます。 プルリクエストの議論を保持しているページに自動的に表示されるはずです。

    所有者が要求するかもしれない1つの潜在的なタイプの変更は、コミットを縮小することです。 下記のスカッシュを参照してください。

### Dirty packages

### Making a branch post hoc

### Squashing and rebasing

＊＊＊＊＊＊

## 新しいパッケージを作る

＊＊＊＊＊＊

## パッケージの要件の修正

すでに公開されているパッケージバージョンの登録済みの要件を修正する必要がある場合は、同じバージョンのメタデータを編集するだけで済みます。コミットハッシュは同じですが、バージョンに関連付けられたハッシュは永続的です。

```bash
$ cd ~/.julia/v0.6/METADATA/FooBar/versions/0.0.1 && cat requires
julia 0.3-
$ vi requires
```

コミットハッシュは同じままなので、repoでチェックアウトされるREQUIREファイルの内容は、変更後のMETADATAの要件と一致しません。 これはやむを得ないことです。 ただし、以前のバージョンのパッケージのMETADATAの要件を修正する場合は、現在のバージョンのパッケージでREQUIREファイルも修正する必要があります。

## Requiremenetsの指定

`~/.julia/v0.6/REQUIRE`ファイルとパッケージ内の`REQUIRE`ファイル、`METADATA`パッケージの必要ファイルはインストールが必要なパッケージバージョンの範囲を表すために単純な行ベース形式を使用します。 パッケージREQUIREとMETADATA要求ファイルには、パッケージが動作すると予想されるjuliaのバージョンの範囲も含まれている必要があります。 さらに、パッケージには、テストにのみ必要な追加パッケージを指定するtest / REQUIREファイルを含めることができます。

これらのファイルがどのように解析され、解釈されるかは次のとおりです。

-   ＃マークの後のすべてがコメントとして各行から削除されます。
-   空白以外のものが残っていれば、その行は無視されます。
-   空白以外の文字が残っている場合、その行は必須であり、空白文字で分割されて単語になります。

可能な限り単純な要求は、パッケージ名の名前だけです。

```julia
Distributions
```

この要件は、どのバージョンのDistributionパッケージでも満たされます。 パッケージ名の後ろには、パッケージのバージョンの許容可能な間隔を示す、0以上のバージョン番号を昇順で続けることができます。 あるバージョンは間隔を開き、次のバージョンはそれを閉じ、次のバージョンは新しい間隔を開きます。 奇数のバージョン番号が与えられれば、任意に大きなバージョンが満足される。 偶数のバージョン番号が与えられた場合、最後のバージョン番号は許容バージョン番号の上限です。 たとえば、次の行：

```julia
Distributions 0.1
```

0.1.0以上の任意のバージョンのDistributionで満たされます。 バージョンに接尾辞を付けると、プレリリース版も使用できます。 例えば：

```julia
Distributions 0.1-
```

0.1-devまたは0.1-rc1のようなプレリリース版、または0.1.0以上の任意のバージョンで満たされます。

この要件エントリ：

```julia
Distributions 0.1 0.2.5
```

0.1.0から0.2.5までのバージョンで満たされます。 0.1.xのバージョンが何をするかを指定したい場合は、次のように記述します。

```julia
Distributions 0.1 0.2-
```

0.2.7以降のバージョンの受け入れを開始したい場合は、次のように書くことができます：

```julia
Distributions 0.1 0.2- 0.2.7
```

要件行に@で始まる先頭の単語がある場合、これはシステムに依存する要件です。 システムがこれらのシステム条件と一致する場合、要件が含まれます。要件が含まれていない場合、要件は無視されます。 例えば：

```julia
@osx Homebrew
```

オペレーティングシステムがOS XのシステムでのみHomebrewパッケージが必要になります。現在サポートされているシステム条件は（階層的に）次のとおりです。

-   `@unix`
  -   `@linux`
  -   `@bsd`
    -   `@osx`
-   `@windows`

@unix条件は、LinuxおよびBSDを含むすべてのUNIXシステムで満たされます。 否定されたシステム条件は、！ @の後に。 例：

```julia
@!windows
@unix @!osx
```

最初の条件はWindowsを除くすべてのシステムに適用され、2番目の条件はOS X以外のUNIXシステムに適用されます。

Juliaの現在のバージョンのランタイムチェックは、VersionNumberタイプの組み込みVERSION変数を使用して行うことができます。 このようなコードは、Juliaのさまざまなリリース間での新しい機能や非推奨の機能を追跡するために必要な場合があります。 ランタイムチェックの例：

```julia
VERSION < v"0.3-" #exclude all pre-release versions of 0.3

v"0.2-" <= VERSION < v"0.3-" #get all 0.2 versions, including pre-releases, up to the above

v"0.2" <= VERSION < v"0.3-" #To get only stable 0.2 versions (Note v"0.2" == v"0.2.0")

VERSION >= v"0.2.1" #get at least version 0.2.1
```

より完全な説明については、バージョン番号のリテラルに関するセクションを参照してください。
