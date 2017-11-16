# モジュール

Juliaにおけるモジュールは別々の変数ワークスペースです。つまり、新しいグローバルスコープを導入します。それらは構文的に`module Name ... end`の内側として区切られています。モジュールは、コードが他の誰かと一緒に使用されるときに、名前の競合を心配することなく、トップレベルの定義（別名グローバル変数）を作成することを可能にします。モジュール内では、他のモジュールのどの名前を（インポートによって）表示するかを制御したり、名前を公開することを（エクスポートを介して）指定することができます。

次の例はモジュールの主な機能を説明しています。実行できるわけではありませんが、理解しやすくするために載せています。

```julia
module MyModule
using Lib

using BigLib: thing1, thing2

import Base.show

importall OtherLib

export MyType, foo

struct MyType
	x
end

bar(x) = 2x
foo(a::MyType) = bar(a.x) + 1

show(io::IO, a::MyType) = println(io, "MyType $(a.x)")
end
```

モジュールの中身はインデントしていないことに注意してください。これは、通常ファイル全体がインデントされるためです。

このモジュールは型`MyType`と２つの関数を定義しています。関数`foo`と型`MyType`はexportされているため、他のモジュールの中にimportすることができます。関数`bar`は`MyModule`専用です。

文`using Lib`は

＊＊＊＊＊＊＊

## モジュールの使い方の概要

モジュールを読み込むには、主に２つのキーワードが使われます。`using`と`import`です。２つの違いを理解するために、次の例を考えましょう。

```julia
module MyModule

export x, y

x() = "x"
y() = "y"
p() = "p"

end
```

このモジュールでは、関数`x`と`y`は（キーワード`export`を使って）exportされていて、関数`p`はexportされていません。モジュールとその内部の関数を現在の作業領域に読み込む方法にはいくつかの違う方法があります。

| 読み込みコマンド                        | スコープにもってこられるもの                           | メソッド拡張で利用可能なもの                           |
| ------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `using MyModule`                | 全ての`export`された名前（`x`と`y`）と`MyModule.x`、`MyModule.p` | `MyModule.x`, `MyModule.y`, `MyModule.p` |
| `using MyModule.x, MyModule.p`  | `x`と`p`                                  |                                          |
| `using MyModule: x, p`          | `x`と`p`                                  |                                          |
| `import MyModule`               | `MyModule.x`, `MyModule.y`, `MyModule.p` | `MyModule.x`, `MyModule.y`, `MyModule.p` |
| `import MyModule.x, MyModule.y` | `x`と`p`                                  | `x`と`p`                                  |
| `import MyModule: x, p`         | `x`と`p`                                  | `x`と`p`                                  |
| `importall MyModule`            | `export`された全ての名前（`x`と`y`）                | `x`と`y`                                  |

### モジュールとファイル

ファイルとファイル名はモジュールとはほとんど関係がありません。モジュールはモジュールの表現とだけ関連付けられます。１つのモジュールが複数のファイルに分かれていても良いし、１つのファイルに複数のモジュールが含まれていてもよいです。

```julia
module Foo

include("file1.jl")
include("file2.jl")

end
```

異なるモジュールに同じコードを組み込むことで、mixinのような動作が実現します。 これを使用して、異なる基本定義を持つ同じコードを実行することができます。たとえば、いくつかの演算子の「安全な」バージョンでコードを実行するなど、

```julia
module Normal
include("mycode.jl")
end

module Testing
include("safe_operations.jl")
include("mycode.jl")
end
```

### 標準モジュール

３つの重要な標準モジュールがあります。MainとCoreとBaseです。

Mainはトップレベルのモジュールで、JuliaはMainを現在のモジュールとしてセットした状態で起動します。プロンプトで定義された変数はMainに登録され、`whos()`はMainの中にある変数をリストアップします。

Coreは言語に「組み込まれている」とみなされる全ての識別子を持っています。つまり、コア言語の一部でありライブラリではありません。全てのモジュールは暗黙的に`using Core`が指定されています。そうでなければCoreの定義がないため、何もできなくなってしまうからです。

Baseは標準ライブラリ（base/の内容）です。全てのモジュールで大抵Baseを必要とするため、全てのモジュールは暗黙的に`using Base`を含むようになっています。

### デフォルトトップレベル定義と裸モジュール

`using Base`に加えて、モジュールは自動的に`eval`関数の定義を含むようにもなっています。`eval`関数はそのモジュールの中身の表現を評価します。

もし、これらのデフォルト定義が必要ない場合は、代わりにキーワード`baremodule`を使うことによってモジュールを定義することができます（注意：上記のように、この場合でも`Core`は読み込まれます）。`baremodule`では標準の`module`はこのように見えます。

```julia
baremodule Mod

using Base

eval(x) = Core.eval(Mod, x)
eval(m, x) = Core.eval(m, x)

...

end
```

### 相対モジュールパスと絶対モジュールパス

### モジュールファイルパス

大域変数`LOAD_PATH`には、`require`を

