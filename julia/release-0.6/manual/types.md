# 型

型システムは伝統的に２つの全く異なる立場に分類されています。静的型システムと動的型システムです。静的型システムではプログラムの実行前に計算可能な型を持ちます。動的型システムでは実行時まで型については何も知られておらず、プログラムが利用可能になったときに実際の値は操作されます。 オブジェクト志向は、静的型付けされた言語において、コンパイル時に正確な型の値が知らされていない状態でもコードを記述できるようにすることで、柔軟性を持たせます。 異なる型で動作できるコードを書く能力は、多相性 (polymorphism) と呼ばれます。 動的に型定義された古典的な言語のコードはすべて、多相的です。タイプを明示的にチェックするか、オブジェクトが実行時に操作をサポートできない場合は、値の型が制限されます。

Juliaの型システムは動的ですが、特定の値が特定の型であることを示すことができるようにすることで、静的型システムの利点のいくつかを得ています。 これは効率的なコードを生成する上で大きな助けになる可能性がありますが、さらに重要なことは、関数引数の型に対するメソッドディスパッチを言語と深く統合できることです。 メソッドディスパッチは、[メソッド](https://paalon.github.io/julia/manual/methods)で詳細に調べられますが、ここに示す型システムに根ざしています。

Juliaの型が省略されたときのデフォルトの振る舞いは、値が任意の型になることを可能にすることです。 したがって、型を明示的に使用することなく、多くの有用なJuliaプログラムを書くことができます。 しかし、さらなる表現力が必要な場合、以前の「型なし」コードに明示的な型注釈を徐々に導入するのは簡単です。 そうすることで、通常、これらのシステムのパフォーマンスと堅牢性が向上し、多分直観に反して、しばしば大幅に単純化されます。

型システムの用語でJuliaを説明すると、動的、名目上、パラメトリックです。 汎用型をパラメータ化することができ、型間の階層関係は、互換性のある構造ではなく明示的に宣言されます。 Juliaの型システムの1つの特に特徴的な点は、具体的な型は互いにサブタイプを持たなくてもよいことです。すべての具体的な型は最終的なものであり、抽象型のみをそのスーパータイプとして持つことができます。 これは最初は過度に制限されているように見えるかもしれませんが、それには驚くほどわずかな欠点を伴う多くの有益な結果があります。 振る舞いを継承できることは構造を継承することよりも重要であり、継承することは伝統的なオブジェクト指向言語において重大な困難を引き起こすことが判明しています。 Juliaのタイプシステムの他の上位レベルの側面は、次のとおりです。

-   Juliaのすべての値は、完全に接続された1つの型のグラフに属する型を持つ真のオブジェクトであり、すべてのノードが同様にファーストクラスのタイプである。
-   「コンパイル時の型」という意味の概念はありません。値が持つ唯一の型は、プログラムが実行されているときの実際の型です。 オブジェクト指向言語では、これを静的コンパイルと多相性の組み合わせで区別することができる、「実行時型」と呼ばれています。
-   変数ではなく値だけが型を持ちます。変数は単に値に結び付けられた名前です。
-   抽象型と具象型の両方を他の型でパラメータ付けることができます。 また、記号や、`isbits`がtrueを返す任意の型の値（基本的には数値やブール値などの値はC言語の型や構造体のように、他のオブジェクトへのポインタを持たずに格納される）やそのタプルによってもパラメータ付けることができます。 型パラメータは、参照または制限する必要がない場合は省略することができます。

Juliaのタイプシステムは、強力で表現力豊かではあるが、はっきりとわかりやすく、直感的で邪魔にならないように設計されています。 多くのJuliaプログラマは、明示的に型を使用するコードを書く必要性を感じることはありません。 しかし、いくつかの種類のプログラミングは、宣言された型に対してより明確で、よりシンプルに、より速く、より堅牢になります。

## 型の宣言 / Type Declarations

`::`演算子を使用して、プログラム内の式や変数に型注釈を付けることができます。 これには主に2つの理由があります。

1.  プログラムが期待どおりに動作することを確認するためのアサーションとして、
2.  コンパイラに追加の型情報を提供することで、場合によってはパフォーマンスを向上させることができます

値を計算する式に追加すると、`::`演算子は "is an instance of"と読み込まれます。 左辺の式の値が右辺の型のインスタンスであることを宣言するために、どこでも使用できます。 右側の型が具体的な場合、左側の値はその実装としてその型を持たなければなりません。具体的な型はすべて最終型であるため、他の型の実装は実装されません。 型が抽象型である場合、抽象型のサブタイプである具体的な型によって値が実装されていれば十分です。 型アサーションが真でない場合は例外が投げられ、そうでない場合は左辺値が返されます。

```julia
julia> (1+2)::AbstractFloat
ERROR: TypeError: in typeassert, expected AbstractFloat, got Int64

julia> (1+2)::Int
3
```

これにより、タイプアサーションを任意の式にインプレースでアタッチすることができます。

代入の左側の変数に、または`local`宣言の一部として追加された場合、`::`演算子は少し違うことを意味します。つまり、変数は常に、指定された型を持つように宣言します。 Cなどの静的型言語のように。変数に割り当てられたすべての値は、`convert`を使用して宣言された型に変換されます。

```julia
julia> function foo()
           x::Int8 = 100
           x
       end
foo (generic function with 1 method)

julia> foo()
100

julia> typeof(ans)
Int8
```

この機能は、変数への代入の1つが予期せずその型を変更した場合に発生する可能性のあるパフォーマンス「不具合」を回避するのに便利です。

この「宣言」挙動は、特定のコンテキストでのみ発生します。

```julia
local x::Int8  # in a local declaration
x::Int8 = 10   # as the left-hand side of an assignment
```

宣言の前であっても、現在のスコープ全体に適用されます。 現在、型宣言はグローバルスコープでは使用できません。 REPLでは、Juliaはまだ定型のグローバルを持っていないためです。

宣言を関数定義に関連付けることもできます。

```julia
function sinc(x)::Float64
    if x == 0
        return 1
    end
    return sin(pi*x)/(pi*x)
end
```

この関数からの返り値は、宣言された型を持つ変数への代入と同様に動作します。値は常に`Float64`に変換されます。

## 抽象型 / Abstract Types

抽象型はインスタンス化することはできず、型グラフ内のノードとしてのみ機能し、それによって関連する具体的な型のセット、すなわちそれらの子孫である具体的な型を記述します。 抽象型は、型システムのバックボーンであるためインスタンス化されていないにもかかわらず、抽象型から始まります。それらはJuliaの型システムを単なるオブジェクト実装の集合体以上にする概念的階層を形成します。

整数と浮動小数点数では、`Int8`、`UInt8`、`Int16`、`UInt16`、`Int32`、`UInt32`、`Int64`、`UInt64`、`Int128`、`UInt128`、`Float16`、`Float32`、および`Float64`のさまざまな具体的な数値型を導入したことを思い出してください。それらの表現サイズは異なりますが、`Int8`、`Int16`、`Int32`、`Int64`、および`Int128`はすべて、符号付き整数型であるという共通点があります。同様に、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`UInt128`はすべて符号なし整数型ですが、`Float16`、`Float32`、および`Float64`は整数ではなく浮動小数点型として区別されます。例えば、その引数が何らかの種類の整数であっても、本当に特定の種類の整数に依存していない場合にのみ、コードが意味をなさすのが一般的です。たとえば、最大の共通分母アルゴリズムはあらゆる種類の整数で機能しますが、浮動小数点数では機能しません。抽象型は、型の階層の構築を可能にし、具体的な型が適合できるコンテキストを提供します。これにより、アルゴリズムを特定の整数型に制限することなく、整数型の任意の型に簡単にプログラムすることができます。

抽象型は、`abstract type`キーワードを使用して宣言されます。 抽象型を宣言するための一般的な構文は次のとおりです。

```julia
abstract type «name» end
abstract type «name» <: «supertype» end
```

`abstract type`キーワードは、新しい抽象型を導入します。名前は、`«name»`で与えられます。 この名前の後にオプションで`<:`と既に存在する型が続き、新しく宣言された抽象型がこの "親"型のサブタイプであることを示します。

スーパータイプが指定されていない場合、デフォルトのスーパータイプはAny - すべてのオブジェクトがインスタンスであり、すべてのタイプがのサブタイプである、事前定義された抽象タイプです。 タイプ理論では、タイプグラフの頂点にあるため、Anyは一般に「トップ」と呼ばれます。 Juliaはまた、定義された抽象的な「ボトム」型を、型グラフの最下位にあり、連合{}として書かれている。 これはAnyとまったく反対です。オブジェクトはUnion {}のインスタンスではなく、すべてのタイプはUnion {}のスーパータイプです。

Juliaの数値階層を構成する抽象型のいくつかを考えてみましょう：

```julia
abstract type Number end
abstract type Real     <: Number end
abstract type AbstractFloat <: Real end
abstract type Integer  <: Real end
abstract type Signed   <: Integer end
abstract type Unsigned <: Integer end
```

Number型はAnyの直接の子タイプであり、Realはその子です。 今度は、Realには2人の子供がいます（もっと多くありますが、ここでは2人しか表示されません）。IntegerとAbstractFloatは、世界を整数表現と実数表現に分けています。 実数の表現には、もちろん浮動小数点型が含まれますが、実例などの他の型も含まれます。 したがって、AbstractFloatは実数の浮動小数点表現だけを含むRealの適切なサブタイプです。 整数はさらに、符号付きおよび非符号付きの種類に細分されます。

<：演算子は一般的には "のサブタイプです"を意味し、このような宣言で使用され、右手型が新しく宣言された型の直上のスーパータイプであると宣言します。 また、左辺オペランドが右オペランドのサブタイプである場合にtrueを返すサブタイプ演算子として式で使用することもできます。

```julia
julia> Integer <: Number
true

julia> Integer <: AbstractFloat
false
```

抽象型の重要な用途は、具体的な型のデフォルトの実装を提供することです。 簡単な例を挙げてみましょう。

```julia
function myplus(x,y)
    x+y
end
```

最初の注意点は、上記の引数宣言がx :: Anyおよびy :: Anyと等価であることです。 この関数が呼び出されると、たとえば、myplus（2,5）として、ディスパッチャーは指定された引数に一致する最も特定のメソッドmyplusを選択します。 （マルチディスパッチの詳細については、メソッドを参照してください）。

上記よりも具体的なメソッドが見つからないと仮定すると、ジュリアは内部的に上記の汎用関数に基づいて2つのInt引数に対してmyplusというメソッドを内部的に定義しコンパイルします。つまり、暗黙的に定義してコンパイルします。

```julia
function myplus(x::Int,y::Int)
    x+y
end
```

最後に、この特定のメソッドを呼び出します。

したがって、抽象型を使用すると、後でデフォルトメソッドとして使用できる汎用関数をプログラマが記述できるようになります。 複数のディスパッチのおかげで、プログラマは、デフォルトのメソッドまたはより特定のメソッドを使用するかどうかを完全に制御できます。

注意すべき重要な点は、引数が抽象型である関数にプログラマが依存する場合、プログラマが呼び出される引数の具体的な型の各タプルに対して再コンパイルされるため、プログラマがパフォーマンスに損失がないことです。 ただし、抽象型のコンテナである関数の引数の場合は、パフォーマンスの問題が発生する可能性があります（「パフォーマンスのヒント」を参照）。

## 原始型 / Primitive Types

プリミティブ型は、データが普通の古いビットで構成される具象型です。 プリミティブ型の古典的な例は、整数と浮動小数点値です。 ほとんどの言語とは異なり、Juliaでは組み込み関数の固定セットのみを提供するのではなく、独自のプリミティブ型を宣言できます。 実際、標準プリミティブ型はすべて言語自体で定義されています。

```julia
primitive type Float16 <: AbstractFloat 16 end
primitive type Float32 <: AbstractFloat 32 end
primitive type Float64 <: AbstractFloat 64 end

primitive type Bool <: Integer 8 end
primitive type Char 32 end

primitive type Int8    <: Signed   8 end
primitive type UInt8   <: Unsigned 8 end
primitive type Int16   <: Signed   16 end
primitive type UInt16  <: Unsigned 16 end
primitive type Int32   <: Signed   32 end
primitive type UInt32  <: Unsigned 32 end
primitive type Int64   <: Signed   64 end
primitive type UInt64  <: Unsigned 64 end
primitive type Int128  <: Signed   128 end
primitive type UInt128 <: Unsigned 128 end
```

プリミティブ型を宣言するための一般的な構文は次のとおりです。

```julia
primitive type «name» «bits» end
primitive type «name» <: «supertype» «bits» end
```

ビット数は、タイプが必要とするストレージの量を示し、名前は新しいタイプに名前を与えます。プリミティブ型は、スーパータイプのサブタイプであると任意に宣言することができます。スーパータイプが省略されている場合、そのタイプのデフォルト値は、直後のスーパータイプとして`Any`を持つことになります。したがって、上記の`Bool`の宣言は、ブール値が格納に8ビットを要し、`Integer`を直接スーパータイプとして持つことを意味します。現在、8ビットの倍数であるサイズのみがサポートされています。したがって、ブール値は実際には単なるビットである必要がありますが、8ビットより小さく宣言することはできません。

タイプ`Bool`、`Int8`、`UInt8`はすべて同じ表現をしています。つまり、8ビットのメモリチャンクです。しかし、Juliaのタイプシステムは名目上のものであるため、同一の構造を持っていても互換性はありません。基本的な相違点は、`Bool`の直接スーパータイプがInteger、Int8がSigned、UInt8がUnsignedであることです。 Bool、Int8、およびUInt8の間のその他の相違点は、ビヘイビアの問題です。これらの型のオブジェクトが引数として渡されたときに関数が動作するように定義されています。これは、名詞型のシステムが必要な理由です。構造体の型が振る舞いを決定する場合、BoolはInt8やUInt8とは異なる振る舞いをすることは不可能です。

## 合成型 / Composite Types

複合型は、さまざまな言語のレコード、構造体、またはオブジェクトと呼ばれます。複合型は、名前付きフィールドのコレクションであり、そのインスタンスは単一の値として扱うことができます。多くの言語では、コンポジット型はユーザ定義可能な唯一の型であり、Juliaでも最も一般的に使用されるユーザ定義型です。

C ++、Java、Python、Rubyなどの主流のオブジェクト指向言語では、複合型にもそれらに関連付けられた名前付き関数があり、この組み合わせを「オブジェクト」と呼びます。 RubyやSmalltalkのようなより純粋なオブジェクト指向言語では、すべての値は合成であろうとなかろうとオブジェクトです。より純粋でないオブジェクト指向言語（C ++やJavaなど）では、整数や浮動小数点値などの一部の値はオブジェクトではなく、ユーザー定義の複合型のインスタンスは、関連するメソッドを持つ真のオブジェクトです。 Juliaでは、すべての値がオブジェクトですが、関数は操作対象のオブジェクトにバンドルされていません。これは、Juliaが複数のディスパッチで使用する関数のメソッドを選択するために必要です。これは、関数の引数のすべての型が、メソッドを選択するときに最初のものだけではなく考慮されることを意味します（メソッドおよびディスパッチ）。したがって、関数が最初の引数だけに属していることは不適切です。各オブジェクトの "内側"に名前のついたバッグを持たせるのではなく、メソッドを関数オブジェクトに編成することは、言語設計の非常に有益な側面になります。

コンポジット型は、structキーワードの後ろにフィールド名のブロックが続き、必要に応じて:: operatorを使用して型を注釈します。

```julia
julia> struct Foo
           bar
           baz::Int
           qux::Float64
       end
```

型アノテーションのないフィールドは、デフォルトで`Any`型であるため、任意の型の値を保持できます。

`Foo`型の新しいオブジェクトは、関数のような`Foo`型オブジェクトをそのフィールドの値に適用することによって作成されます：

```julia
julia> foo = Foo("Hello, world.", 23, 1.5)
Foo("Hello, world.", 23, 1.5)

julia> typeof(foo)
Foo
```

型が関数のように適用されるとき、それはコンストラクタと呼ばれます。 2つのコンストラクタが自動的に生成されます（これらはデフォルトコンストラクタと呼ばれます）。 1つは引数を受け取り、convertを呼び出してフィールドの型に変換し、もう1つはフィールドの型に完全に一致する引数を受け取ります。 これらの両方が生成される理由は、これにより、不注意にデフォルトのコンストラクタを置き換えずに新しい定義を追加することが容易になります。

barフィールドはタイプに制限されていないので、任意の値が有効です。 ただし、bazの値はIntに変換可能である必要があります。

```julia
julia> Foo((), 23.5, 1)
ERROR: InexactError: convert(Int64, 23.5)
Stacktrace:
 [1] convert at ./float.jl:703 [inlined]
 [2] Foo(::Tuple{}, ::Float64, ::Int64) at ./none:2
```

fieldnames関数を使用して、フィールド名のリストを見つけることができます。

```julia
julia> fieldnames(Foo)
3-element Array{Symbol,1}:
 :bar
 :baz
 :qux
```

伝統的な`foo.bar`表記を使用して複合オブジェクトのフィールド値にアクセスできます。

```julia
julia> foo.bar
"Hello, world."

julia> foo.baz
23

julia> foo.qux
1.5
```

structで宣言された複合オブジェクトは不変です。 建設後に変更することはできません。 これは最初は奇妙に見えるかもしれませんが、いくつかの利点があります：

-   より効率的にすることができます。 いくつかの構造体は配列に効率的にパックすることができ、場合によっては、不変オブジェクトを完全に割り当てることを避けることができます。
-   型のコンストラクタによって提供される不変量に違反することはできません。
-   不変オブジェクトを使用するコードは、推論するのが簡単になります。

不変オブジェクトには、配列などの変更可能なオブジェクトがフィールドとして含まれることがあります。 含まれているオブジェクトは変更可能なままです。 不変オブジェクト自体のフィールドだけを変更して、異なるオブジェクトを指すことはできません。

必要に応じて、mutable構造体をキーワードmutable structで宣言することができます（次のセクションで説明します）。

フィールドのない複合型はシングルトンです。 そのような型のインスタンスは1つだけです。

```julia
julia> struct NoFields
       end

julia> NoFields() === NoFields()
true
```

`===`関数は、`NoFields`の2つの構築されたインスタンスが実際には1つで同じであることを確認します。 シングルトンタイプについては、以下にさらに詳しく説明します。

複合型のインスタンスがどのように作成されるかについてははるかに多くのことが言えますが、その議論はパラメトリック型とメソッドの両方に依存し、独自のセクションで対処するには十分に重要です。

## 可変合成型 / Mutable Composite Types

コンポジット型がstructではなくmutable structで宣言されている場合、そのインスタンスは変更できます。

```julia
julia> mutable struct Bar
           baz
           qux::Float64
       end

julia> bar = Bar("Hello", 1.5);

julia> bar.qux = 2.0
2.0

julia> bar.baz = 1//2
1//2
```

変異をサポートするために、そのようなオブジェクトは一般にヒープ上に割り当てられ、安定したメモリアドレスを有する。 変更可能なオブジェクトは、時間の経過とともに異なる値を保持する可能性がある小さなコンテナと似ています。したがって、そのアドレスでのみ確実に識別できます。 対照的に、不変型のインスタンスは特定のフィールド値に関連付けられています。フィールド値だけでオブジェクトについての情報がすべて伝えられます。 タイプを変更可能にするかどうかを決めるには、同じフィールド値を持つ2つのインスタンスが同一であると考えられるかどうか、または時間の経過とともに独立して変更する必要があるかどうかを尋ねます。 それらが同一であると考えられるならば、型はおそらく不変であるべきです。

要約すると、Juliaにおける不変性を定義する2つの重要な特性：

-   不変型のオブジェクトは、コピーによって代入文と関数呼び出しの両方で渡されますが、変更可能な型は参照渡しされます。
-   コンポジット不変型のフィールドを変更することはできません。

C / C ++のバックグラウンドを持つ読者にとっては、なぜこれらの2つのプロパティが連携しているのかを考えるのは有益なことです。 それらが分離されている場合、すなわちコピーによって渡されたオブジェクトのフィールドが変更された場合、ジェネリックコードの特定のインスタンスについて推論することはより困難になります。 たとえば、xが抽象型の関数引数であり、関数がフィールドを変更したとします：x.isprocessed = trueとします。 コピーまたは参照によってxが渡されるかどうかによって、このステートメントは呼び出し側ルーチンの実際の引数を変更する場合と変更しない場合があります。 Juliaは、このシナリオで未知の効果を持つ関数を作成する可能性を回避するため、コピーによって渡されたオブジェクトのフィールドの変更を禁止します。

## 宣言された型 / Declared Types

前の3つのセクションで説明した3種類のタイプは、実際はすべて密接に関連しています。 それらは同じキープロパティを共有します：

-   それらは明示的に宣言されています。
-   彼らは名前を持っています。
-   彼らは明示的にスーパータイプを宣言しています。
-   彼らはパラメータを持つかもしれません。

これらの共有プロパティのため、これらの型は内部的に同じコンセプトのインスタンスとして表され、DataTypeはこれらの型のいずれかの型です。

```julia
julia> typeof(Real)
DataType

julia> typeof(Int)
DataType
```

`DataType`は、抽象的または具体的なものであってもよい。 具体的であれば、指定されたサイズ、ストレージレイアウト、（オプションで）フィールド名を持ちます。 したがって、プリミティブ型は、サイズがゼロではなくフィールド名を持たない`DataType`です。 コンポジット型は、フィールド名を持つデータ型、または空（ゼロサイズ）のデータ型です。

システムのあらゆる具体的な値は、いくつかの`DataType`のインスタンスです。

## Type Unions

型共用体は特殊な抽象型であり、特殊なUnion関数を使用して構築された、その引数型のすべてのインスタンスをオブジェクトとして含みます。

```julia
julia> IntOrString = Union{Int,AbstractString}
Union{Int64, AbstractString}

julia> 1 :: IntOrString
1

julia> "Hello!" :: IntOrString
"Hello!"

julia> 1.0 :: IntOrString
ERROR: TypeError: in typeassert, expected Union{Int64, AbstractString}, got Float64
```

多くの言語のコンパイラには、型についての推論のための内部結合構造があります。 Juliaはそれを単にプログラマに公開します。

## パラメトリック（パラメータ付きの）型 / Parametric Types

Juliaの型システムの重要かつ強力な機能は、パラメトリックであること（パラメータを付けられる）ことです。型はパラメータを取ることができるので、型宣言は実際に新しい型のファミリを導入します。一般的なプログラミングのいくつかのバージョンをサポートする多くの言語があります。これらの言語を操作するデータ構造やアルゴリズムは、正確な型を指定することなく指定できます。例えば、いくつか例を挙げると、MLやHaskell、Ada、Eiffel、C ++、Java、C＃、F＃、Scalaには、ある形でのジェネリックプログラミングができます。これらの言語の中には真のパラメトリック多相性（例えばML、Haskell、Scala）をサポートするものもあれば、テンプレートベースの一般的なプログラミングスタイル（例えばC ++、Java）をサポートするものもあります。さまざまな言語のジェネリックプログラミングとパラメトリックタイプが多種多様であるため、Juliaのパラメトリックタイプを他の言語と比較しようとはしませんが、代わりにJuliaのシステムについて説明することに専念します。しかし、Juliaは動的に型指定された言語であり、コンパイル時にすべての型決定を行う必要がないため、静的パラメトリック型システムで発生する多くの従来の問題は比較的簡単に処理できます。

宣言されたすべての型（`DataType`の一種）は、それぞれの場合と同じ構文でパラメータ付けることができます。パラメトリック合成型、パラメトリック抽象型、パラメトリック原始型の順に説明します。

### パラメトリック合成型

型パラメータは、中括弧で囲まれた型名の直後に挿入されます。

```julia
julia> struct Point{T}
           x::T
           y::T
       end
```

この宣言は、タイプTの2つの「座標」を保持する新しいパラメトリックタイプ、Point {T}を定義します。 さて、それはパラメトリック型のポイントです。それはどんな型でも（実際には型として明示的に使用されていますが、実際には任意のビット型の値でもかまいません）。 Point {Float64}は、PointをFloat64に置き換えて定義した型に相当する具体的な型です。 したがって、この1つの宣言は、実際にはPoint {Float64}、Point {AbstractString}、Point {Int64}など、無制限の数の型を宣言します。

```julia
julia> Point{Float64}
Point{Float64}

julia> Point{AbstractString}
Point{AbstractString}
```

タイプPoint {Float64}は座標が64ビットの浮動小数点値であり、タイプPoint {AbstractString}は "座標"が文字列オブジェクト（Stringを参照）である "ポイント"です。

Point自体は有効な型オブジェクトであり、すべてのインスタンスPoint {Float64}、Point {AbstractString}などをサブタイプとして含みます。

```julia
julia> Point{Float64} <: Point
true

julia> Point{AbstractString} <: Point
true
```

他の型はもちろんそのサブ型ではありません：

```julia
julia> Float64 <: Point
false

julia> AbstractString <: Point
false
```

`T`の値が異なる具体的な`Point`型は決して相互のサブ型ではありません。

```julia
julia> Point{Float64} <: Point{Int64}
false

julia> Point{Float64} <: Point{Real}
false
```

警告

この最後の点は非常に重要です：たとえ`Float64 <: Real`であっても、`Point{Float64} <: Point{Real}`はありません。

言い換えると、型理論の言い回しにおいて、Juliaの型パラメータは、共変（または反変）さえあるのではなく、不変である。これは実用的な理由です：`Point{Float64}`のインスタンスは、概念的には`Point{Real}`のインスタンスのようなものかもしれませんが、2つのタイプはメモリ内で異なる表現をしています：

-   `Point{Float64}`のインスタンスは、64ビット値の直近のペアとしてコンパクトかつ効率的に表現できます。
-   `Point{Real}`のインスタンスは、`Real`のインスタンスのペアを保持できる必要があります。`Real`のインスタンスであるオブジェクトは任意のサイズと構造にできるため、実際には`Point{Real}`のインスタンスは個別に割り当てられた`Real`オブジェクトへのポインタのペアとして表現されなければなりません。

`Array{Float64}`は、64ビット浮動小数点値の連続したメモリブロックとして格納することができますが、`Array{Float64}`は連続した64ビット浮動小数点値のメモリブロックとして格納することができます。 {Real}は、個別に割り当てられた`Real`オブジェクトへのポインタの配列でなければなりません。これは、ボックス化された64ビット浮動小数点値ですが、`Real`抽象タイプの実装と宣言されている任意の大きさの複雑なオブジェクトでもかまいません。

`Point{Float64}`は`Point{Real}`のサブタイプではないので、`Point{Float64}`型の引数には次のメソッドを適用できません。

```julia
function norm(p::Point{Real})
    sqrt(p.x^2 + p.y^2)
end
```

TがRealのサブタイプであるPoint {T}型のすべての引数を受け入れるメソッドを定義する正しい方法は次のとおりです。

```julia
function norm(p::Point{<:Real})
    sqrt(p.x^2 + p.y^2)
end
```

（等価的に、関数ノルム{T <：Real}（p :: Point {T}）または関数ノルム（p :: Point {T}、ここでT <：Real）を定義することができます。

より多くの例については、メソッドの後半で説明します。

どのようにしてPointオブジェクトを構成しますか？ コンストラクタで詳細に説明するコンポジット型のカスタムコンストラクタを定義することは可能ですが、特別なコンストラクタ宣言がない場合は、新しい複合オブジェクトを作成するデフォルトの方法が2つあります.1つは、型パラメータを明示的に指定します もう1つはオブジェクトコンストラクタへの引数によって暗示されています。

Point型{Float64}は、Tの代わりにFloat64で宣言されたPointに相当する具体的な型であるため、それに応じてコンストラクタとして適用できます。

```julia
julia> Point{Float64}(1.0, 2.0)
Point{Float64}(1.0, 2.0)

julia> typeof(ans)
Point{Float64}
```

デフォルトのコンストラクタでは、各フィールドに1つの引数を指定する必要があります。

```julia
julia> Point{Float64}(1.0)
ERROR: MethodError: Cannot `convert` an object of type Float64 to an object of type Point{Float64}
This may have arisen from a call to the constructor Point{Float64}(...),
since type constructors fall back to convert methods.
Stacktrace:
 [1] Point{Float64}(::Float64) at ./sysimg.jl:114

julia> Point{Float64}(1.0,2.0,3.0)
ERROR: MethodError: no method matching Point{Float64}(::Float64, ::Float64, ::Float64)
```

パラメトリック型に対しては、デフォルトのコンストラクタは1つだけ生成されます。オーバーライドできないためです。 このコンストラクタは引数を受け取り、フィールド型に変換します。

多くの場合、コンストラクタ呼び出しの引数の型はすでに暗黙的に型情報を提供しているため、作成したいPointオブジェクトの型を提供することは冗長です。 そのため、パラメータ型Tの暗黙の値が明白であれば、Point自体をコンストラクタとして適用することもできます。

```julia
julia> Point(1.0,2.0)
Point{Float64}(1.0, 2.0)

julia> typeof(ans)
Point{Float64}

julia> Point(1,2)
Point{Int64}(1, 2)

julia> typeof(ans)
Point{Int64}
```

`Point`の場合、`Point`の2つの引数が同じ型である場合に限り、`T`の型は明白に暗示されます。 そうでない場合、コンストラクタは`MethodError`で失敗します：

```julia
julia> Point(1,2.5)
ERROR: MethodError: no method matching Point(::Int64, ::Float64)
Closest candidates are:
  Point(::T, !Matched::T) where T at none:2
```

そのような混合されたケースを適切に処理するためのコンストラクタメソッドは定義できますが、後でコンストラクタで議論されることはありません。

### パラメトリック抽象型

パラメトリック抽象型の宣言は他と同じように抽象型のコレクションを宣言します：

```julia
julia> abstract type Pointy{T} end
```

この宣言では、`Pointy{T}`は各型の異なった抽象型または`T`の整数値です。パラメトリック合成型と一緒だと、そのようなインスタンスはそれぞれ`Pointy`のサブ型です。

```julia
julia> Pointy{Int64} <: Pointy
true

julia> Pointy{1} <: Pointy
true
```

パラメトリック抽象型は、パラメトリック合成型と同じように不変です。

```julia
julia> Pointy{Float64} <: Pointy{Real}
false

julia> Pointy{Real} <: Pointy{Float64}
false
```

`Pointy{>:Int}`がJuliaにおける**反変**型のアナローグである一方で、`Pointy{<:Real}`はJuliaにおける**共変**型のアナローグの表現するのに使われますが、技術的には、これらの表現は型の**集合**を表します（[UnionAll Types](https://docs.julialang.org/en/latest/manual/types/#UnionAll-Types-1)を見よ）。

```julia
julia> Pointy{Float64} <: Pointy{<:Real}
true

julia> Pointy{Real} <: Pointy{>:Int}
true
```

Much as plain old abstract types serve to create a useful hierarchy of types over concrete types, parametric abstract types serve the same purpose with respect to parametric composite types. We could, for example, have declared `Point{T}` to be a subtype of `Pointy{T}` as follows:

```julia
julia> struct Point{T} <: Pointy{T}
           x::T
           y::T
       end
```

Given such a declaration, for each choice of `T`, we have `Point{T}` as a subtype of `Pointy{T}`:

```julia
julia> Point{Float64} <: Pointy{Float64}
true

julia> Point{Real} <: Pointy{Real}
true

julia> Point{AbstractString} <: Pointy{AbstractString}
true
```

This relationship is also invariant:

```julia
julia> Point{Float64} <: Pointy{Real}
false

julia> Point{Float64} <: Pointy{<:Real}
true
```

What purpose do parametric abstract types like `Pointy` serve? Consider if we create a point-like implementation that only requires a single coordinate because the point is on the diagonal line *x = y*:

```julia
julia> struct DiagPoint{T} <: Pointy{T}
           x::T
       end
```

Now both `Point{Float64}` and `DiagPoint{Float64}` are implementations of the `Pointy{Float64}`abstraction, and similarly for every other possible choice of type `T`. This allows programming to a common interface shared by all `Pointy` objects, implemented for both `Point` and `DiagPoint`. This cannot be fully demonstrated, however, until we have introduced methods and dispatch in the next section, [Methods](https://docs.julialang.org/en/latest/manual/methods/#Methods-1).

There are situations where it may not make sense for type parameters to range freely over all possible types. In such situations, one can constrain the range of `T` like so:

```julia
julia> abstract type Pointy{T<:Real} end
```

With such a declaration, it is acceptable to use any type that is a subtype of [`Real`](https://docs.julialang.org/en/latest/stdlib/numbers/#Core.Real) in place of `T`, but not types that are not subtypes of `Real`:

```julia
julia> Pointy{Float64}
Pointy{Float64}

julia> Pointy{Real}
Pointy{Real}

julia> Pointy{AbstractString}
ERROR: TypeError: in Pointy, in T, expected T<:Real, got Type{AbstractString}

julia> Pointy{1}
ERROR: TypeError: in Pointy, in T, expected T<:Real, got Int64
```

Type parameters for parametric composite types can be restricted in the same manner:

```julia
struct Point{T<:Real} <: Pointy{T}
    x::T
    y::T
end
```

To give a real-world example of how all this parametric type machinery can be useful, here is the actual definition of Julia's [`Rational`](https://docs.julialang.org/en/latest/stdlib/numbers/#Base.Rational) immutable type (except that we omit the constructor here for simplicity), representing an exact ratio of integers:

```julia
struct Rational{T<:Integer} <: Real
    num::T
    den::T
end
```

It only makes sense to take ratios of integer values, so the parameter type `T` is restricted to being a subtype of [`Integer`](https://docs.julialang.org/en/latest/stdlib/numbers/#Core.Integer), and a ratio of integers represents a value on the real number line, so any [`Rational`](https://docs.julialang.org/en/latest/stdlib/numbers/#Base.Rational) is an instance of the [`Real`](https://docs.julialang.org/en/latest/stdlib/numbers/#Core.Real) abstraction.

### タプル型

Tuples are an abstraction of the arguments of a function – without the function itself. The salient aspects of a function's arguments are their order and their types. Therefore a tuple type is similar to a parameterized immutable type where each parameter is the type of one field. For example, a 2-element tuple type resembles the following immutable type:

```julia
struct Tuple2{A,B}
    a::A
    b::B
end
```

However, there are three key differences:

-   Tuple types may have any number of parameters.
-   Tuple types are *covariant* in their parameters: `Tuple{Int}` is a subtype of `Tuple{Any}`. Therefore `Tuple{Any}` is considered an abstract type, and tuple types are only concrete if their parameters are.
-   Tuples do not have field names; fields are only accessed by index.

Tuple values are written with parentheses and commas. When a tuple is constructed, an appropriate tuple type is generated on demand:

```julia
julia> typeof((1,"foo",2.5))
Tuple{Int64,String,Float64}
```

Note the implications of covariance:

```julia
julia> Tuple{Int,AbstractString} <: Tuple{Real,Any}
true

julia> Tuple{Int,AbstractString} <: Tuple{Real,Real}
false

julia> Tuple{Int,AbstractString} <: Tuple{Real,}
false
```

Intuitively, this corresponds to the type of a function's arguments being a subtype of the function's signature (when the signature matches).

### [Vararg タプル型](https://docs.julialang.org/en/latest/manual/types/#Vararg-Tuple-Types-1)

The last parameter of a tuple type can be the special type `Vararg`, which denotes any number of trailing elements:

```julia
julia> mytupletype = Tuple{AbstractString,Vararg{Int}}
Tuple{AbstractString,Vararg{Int64,N} where N}

julia> isa(("1",), mytupletype)
true

julia> isa(("1",1), mytupletype)
true

julia> isa(("1",1,2), mytupletype)
true

julia> isa(("1",1,2,3.0), mytupletype)
false
```

Notice that `Vararg{T}` corresponds to zero or more elements of type `T`. Vararg tuple types are used to represent the arguments accepted by varargs methods (see [Varargs Functions](https://docs.julialang.org/en/latest/manual/functions/#Varargs-Functions-1)).

The type `Vararg{T,N}` corresponds to exactly `N` elements of type `T`. `NTuple{N,T}` is a convenient alias for `Tuple{Vararg{T,N}}`, i.e. a tuple type containing exactly `N` elements of type `T`.

#### [シングルトン型](https://docs.julialang.org/en/latest/manual/types/#man-singleton-types-1)

There is a special kind of abstract parametric type that must be mentioned here: singleton types. For each type, `T`, the "singleton type" `Type{T}` is an abstract type whose only instance is the object `T`. Since the definition is a little difficult to parse, let's look at some examples:

```julia
julia> isa(Float64, Type{Float64})
true

julia> isa(Real, Type{Float64})
false

julia> isa(Real, Type{Real})
true

julia> isa(Float64, Type{Real})
false
```

In other words, [`isa(A,Type{B})`](https://docs.julialang.org/en/latest/stdlib/base/#Core.isa) is true if and only if `A` and `B` are the same object and that object is a type. Without the parameter, `Type` is simply an abstract type which has all type objects as its instances, including, of course, singleton types:

```julia
julia> isa(Type{Float64}, Type)
true

julia> isa(Float64, Type)
true

julia> isa(Real, Type)
true
```

Any object that is not a type is not an instance of `Type`:

```julia
julia> isa(1, Type)
false

julia> isa("foo", Type)
false
```

Until we discuss [Parametric Methods](https://docs.julialang.org/en/latest/manual/methods/#Parametric-Methods-1) and [conversions](https://docs.julialang.org/en/latest/manual/conversion-and-promotion/#conversion-and-promotion-1), it is difficult to explain the utility of the singleton type construct, but in short, it allows one to specialize function behavior on specific type *values*. This is useful for writing methods (especially parametric ones) whose behavior depends on a type that is given as an explicit argument rather than implied by the type of one of its arguments.

A few popular languages have singleton types, including Haskell, Scala and Ruby. In general usage, the term "singleton type" refers to a type whose only instance is a single value. This meaning applies to Julia's singleton types, but with that caveat that only type objects have singleton types.

### [Parametric原始型](https://docs.julialang.org/en/latest/manual/types/#Parametric-Primitive-Types-1)

Primitive types can also be declared parametrically. For example, pointers are represented as primitive types which would be declared in Julia like this:

```julia
# 32-bit system:
primitive type Ptr{T} 32 end

# 64-bit system:
primitive type Ptr{T} 64 end
```

The slightly odd feature of these declarations as compared to typical parametric composite types, is that the type parameter `T` is not used in the definition of the type itself – it is just an abstract tag, essentially defining an entire family of types with identical structure, differentiated only by their type parameter. Thus, `Ptr{Float64}` and `Ptr{Int64}` are distinct types, even though they have identical representations. And of course, all specific pointer types are subtypes of the umbrella `Ptr` type:

```julia
julia> Ptr{Float64} <: Ptr
true

julia> Ptr{Int64} <: Ptr
true
```

## UnionAll Types

`Ptr`のようなパラメトリック型は、すべてのインスタンス（`Ptr{Int64}`など）のスーパータイプとして機能すると言ってきました。これはどのように作動しますか？ `Ptr`自体は、参照されるデータの型を知らなくても型が明らかにメモリ操作に使用できないため、通常のデータ型ではありません。答えは、`Ptr`（または`Array`のような他のパラメトリック型）は、`UnionAll`型と呼ばれる異なる種類の型です。このような型は、いくつかのパラメータのすべての値に対して型の*反復結合*を表現します。

`UnionAll`型は、通常、キーワード`where`を使用して記述されます。例えば、`Ptr`はPtr {T}としてより正確に書くことができる。ここで、TはTのある値に対してPtr {T}型のすべての値を意味する。この文脈において、パラメータTはしばしば「型変数」と呼ばれる型を超えた変数のようなものです。各場所で単一の型変数が導入されているので、これらの式は複数のパラメータを持つ型に対してネストされています。たとえば、Array {T、N}（NはT.

タイプアプリケーション構文A {B、C}は、AがUnionAll型であることを要求し、最初にAの最も外側の型変数にBを代入する。結果はCが代入される別のUnionAll型であると考えられる。だからA {B、C}はA {B} {C}と等価です。これは、Array {Float64}のように、型を部分的にインスタンス化できる理由を説明しています。最初のパラメータ値は固定されていますが、2番目の値はすべての値の範囲です。明示的なwhere構文を使用すると、パラメータの任意のサブセットを修正できます。たとえば、すべての1次元配列の型は、Array {T、1}と書くことができます。

タイプ変数は、サブタイプの関係で制限することができます。 Array {T} T <：Integerは、要素型がInteger型のすべての配列を参照します。 Array {<：Integer}の構文は、T <：Integerの場合、Array {T}の便利な省略形です。型変数は、下限と上限の両方を持つことができます。 Array {T} Int <：T <：Numberは、Intsを含むことができるNumbersのすべての配列を参照します（Tは少なくともIntと同じくらい大きい必要があるため）。 T>：Intの構文は、型変数の下限のみを指定するためにも機能し、Array {>：Int}はT>：IntのArray {T}と同じです。

式がネストされる場所以来、型変数境界は外部型変数を参照することができます。 T <：Realは、最初の要素がRealである2タプルを参照し、2番目の要素は任意の種類の配列の任意の種類の配列である2タプルを参照しますtypeには、最初のタプル要素の型が含まれます。

`where`キーワード自体は、より複雑な宣言の中にネストすることができます。たとえば、次の宣言によって作成される2つの型を考えてみましょう。

```julia
julia> const T1 = Array{Array{T,1} where T, 1}
Array{Array{T,1} where T,1}

julia> const T2 = Array{Array{T,1}, 1} where T
Array{Array{T,1},1} where T
```

型`T1`は、1次元配列の1次元配列を定義する。各内部配列は同じ型のオブジェクトで構成されますが、この型は内部配列ごとに異なる場合があります。一方、`T2`型は、内部配列の型がすべて同じでなければならない1次元配列の1次元配列を定義します。 `T2`は、`Array{Array{Int,1},1} <: T2`のような抽象型であり、`T1`は具体的な型であることに注意してください。結果として、`T1`は引数なしのコンストラクタ`a=T1()`で構築できますが、`T2`はできません。

このような型の命名に便利な構文がありますが、これは短い形式の関数定義構文と似ています。

```julia
Vector{T} = Array{T,1}
```

これは、`const Vector = Array{T,1} where T`と等価です。ここで、 `Vector{Float64}`と書くことは`Array{Float64,1}`と書くことと等価で、傘型`Vector`はインスタンスとしてすべての`Array`オブジェクトを持ちます。配列の次元数は要素の種類に関係なく1です。パラメトリック型を常に完全に指定する必要がある言語では、これは特に有用ではありませんが、Juliaでは、要素型のすべての1次元高密度配列を含む抽象型の`Vector`だけを書くことができます。

## 型エイリアス / Type Aliases

すでに表現可能なタイプの新しい名前を導入すると便利なことがあります。 これは簡単な代入文で行うことができます。 たとえば、`UInt32`は`UInt32`または`UInt64`のいずれかにエイリアスされ、システム上のポインタのサイズに適しています。

```julia
# 32-bit system:
julia> UInt
UInt32

# 64-bit system:
julia> UInt
UInt64
```

これは、base / boot.jlの次のコードで行います。

```julia
if Int === Int64
    const UInt = UInt64
else
    const UInt = UInt32
end
```

もちろん、これは`Int`のエイリアスに依存しますが、`Int32`または`Int64`のいずれかの正しい型にあらかじめ定義されています。

浮動小数点レジスタのサイズは、IEEE-754標準で指定されていますが、`Int`のサイズはネイティブのサイズを反映していますが、整数の場合と異なり、整数の場合と異なり、`Float`は特定のサイズの`AbstractFloat`の型エイリアスとして存在しません。 そのマシン上のポインタ）。

## 型の操作 / Operations on Types

Since types in Julia are themselves objects, ordinary functions can operate on them. Some functions that are particularly useful for working with or exploring types have already been introduced, such as the `<:` operator, which indicates whether its left hand operand is a subtype of its right hand operand.

The [`isa`](https://docs.julialang.org/en/latest/stdlib/base/#Core.isa) function tests if an object is of a given type and returns true or false:

```julia
julia> isa(1, Int)
true

julia> isa(1, AbstractFloat)
false
```

The [`typeof`](https://docs.julialang.org/en/latest/stdlib/base/#Core.typeof) function, already used throughout the manual in examples, returns the type of its argument. Since, as noted above, types are objects, they also have types, and we can ask what their types are:

```julia
julia> typeof(Rational{Int})
DataType

julia> typeof(Union{Real,Float64,Rational})
DataType

julia> typeof(Union{Real,String})
Union
```

What if we repeat the process? What is the type of a type of a type? As it happens, types are all composite values and thus all have a type of `DataType`:

```julia
julia> typeof(DataType)
DataType

julia> typeof(Union)
DataType
```

`DataType` is its own type.

Another operation that applies to some types is [`supertype`](https://docs.julialang.org/en/latest/stdlib/base/#Base.supertype), which reveals a type's supertype. Only declared types (`DataType`) have unambiguous supertypes:

```julia
julia> supertype(Float64)
AbstractFloat

julia> supertype(Number)
Any

julia> supertype(AbstractString)
Any

julia> supertype(Any)
Any
```

If you apply [`supertype`](https://docs.julialang.org/en/latest/stdlib/base/#Base.supertype) to other type objects (or non-type objects), a [`MethodError`](https://docs.julialang.org/en/latest/stdlib/base/#Core.MethodError) is raised:

```julia
julia> supertype(Union{Float64,Int64})
ERROR: MethodError: no method matching supertype(::Type{Union{Float64, Int64}})
Closest candidates are:
  supertype(!Matched::DataType) at operators.jl:42
  supertype(!Matched::UnionAll) at operators.jl:47
```

## Custom pretty-printing

Often, one wants to customize how instances of a type are displayed. This is accomplished by overloading the [`show`](https://docs.julialang.org/en/latest/stdlib/io-network/#Base.show-Tuple{Any}) function. For example, suppose we define a type to represent complex numbers in polar form:

```julia
julia> struct Polar{T<:Real} <: Number
           r::T
           Θ::T
       end

julia> Polar(r::Real,Θ::Real) = Polar(promote(r,Θ)...)
Polar
```

Here, we've added a custom constructor function so that it can take arguments of different [`Real`](https://docs.julialang.org/en/latest/stdlib/numbers/#Core.Real) types and promote them to a common type (see [Constructors](https://docs.julialang.org/en/latest/manual/constructors/#man-constructors-1) and [Conversion and Promotion](https://docs.julialang.org/en/latest/manual/conversion-and-promotion/#conversion-and-promotion-1)). (Of course, we would have to define lots of other methods, too, to make it act like a [`Number`](https://docs.julialang.org/en/latest/stdlib/numbers/#Core.Number), e.g. `+`, `*`, `one`, `zero`, promotion rules and so on.) By default, instances of this type display rather simply, with information about the type name and the field values, as e.g. `Polar{Float64}(3.0,4.0)`.

If we want it to display instead as `3.0 * exp(4.0im)`, we would define the following method to print the object to a given output object `io` (representing a file, terminal, buffer, etcetera; see [Networking and Streams](https://docs.julialang.org/en/latest/manual/networking-and-streams/#Networking-and-Streams-1)):

```julia
julia> Base.show(io::IO, z::Polar) = print(io, z.r, " * exp(", z.Θ, "im)")
```

More fine-grained control over display of `Polar` objects is possible. In particular, sometimes one wants both a verbose multi-line printing format, used for displaying a single object in the REPL and other interactive environments, and also a more compact single-line format used for [`print`](https://docs.julialang.org/en/latest/stdlib/io-network/#Base.print) or for displaying the object as part of another object (e.g. in an array). Although by default the `show(io, z)` function is called in both cases, you can define a *different* multi-line format for displaying an object by overloading a three-argument form of `show` that takes the `text/plain` MIME type as its second argument (see [Multimedia I/O](https://docs.julialang.org/en/latest/stdlib/io-network/#Multimedia-I/O-1)), for example:

```julia
julia> Base.show(io::IO, ::MIME"text/plain", z::Polar{T}) where{T} =
           print(io, "Polar{$T} complex number:\n   ", z)
```

(Note that `print(..., z)` here will call the 2-argument `show(io, z)` method.) This results in:

```julia
julia> Polar(3, 4.0)
Polar{Float64} complex number:
   3.0 * exp(4.0im)

julia> [Polar(3, 4.0), Polar(4.0,5.3)]
2-element Array{Polar{Float64},1}:
 3.0 * exp(4.0im)
 4.0 * exp(5.3im)
```

where the single-line `show(io, z)` form is still used for an array of `Polar` values. Technically, the REPL calls `display(z)` to display the result of executing a line, which defaults to `show(STDOUT, MIME("text/plain"), z)`, which in turn defaults to `show(STDOUT, z)`, but you should *not* define new [`display`](https://docs.julialang.org/en/latest/stdlib/io-network/#Base.Multimedia.display) methods unless you are defining a new multimedia display handler (see [Multimedia I/O](https://docs.julialang.org/en/latest/stdlib/io-network/#Multimedia-I/O-1)).

Moreover, you can also define `show` methods for other MIME types in order to enable richer display (HTML, images, etcetera) of objects in environments that support this (e.g. IJulia). For example, we can define formatted HTML display of `Polar` objects, with superscripts and italics, via:

```julia
julia> Base.show(io::IO, ::MIME"text/html", z::Polar{T}) where {T} =
           println(io, "<code>Polar{$T}</code> complex number: ",
                   z.r, " <i>e</i><sup>", z.Θ, " <i>i</i></sup>")
```

A `Polar` object will then display automatically using HTML in an environment that supports HTML display, but you can call `show` manually to get HTML output if you want:

```julia
julia> show(STDOUT, "text/html", Polar(3.0,4.0))
<code>Polar{Float64}</code> complex number: 3.0 <i>e</i><sup>4.0 <i>i</i></sup>
```

An HTML renderer would display this as: `Polar{Float64}` complex number: 3.0 *e*4.0 *i*

As a rule of thumb, the single-line `show` method should print a valid Julia expression for creating the shown object. When this `show` method contains infix operators, such as the multiplication operator (`*`) in our single-line `show` method for `Polar` above, it may not parse correctly when printed as part of another object. To see this, consider the expression object (see [Program representation](https://docs.julialang.org/en/latest/manual/metaprogramming/#Program-representation-1)) which takes the square of a specific instance of our `Polar` type:

```julia
julia> a = Polar(3, 4.0)
Polar{Float64} complex number:
   3.0 * exp(4.0im)

julia> print(:($a^2))
3.0 * exp(4.0im) ^ 2
```

Because the operator `^` has higher precedence than `*` (see [Operator Precedence and Associativity](https://docs.julialang.org/en/latest/manual/mathematical-operations/#Operator-Precedence-and-Associativity-1)), this output does not faithfully represent the expression `a ^ 2` which should be equal to `(3.0 * exp(4.0im)) ^ 2`. To solve this issue, we must make a custom method for `Base.show_unquoted(io::IO, z::Polar, indent::Int, precedence::Int)`, which is called internally by the expression object when printing:

```julia
julia> function Base.show_unquoted(io::IO, z::Polar, ::Int, precedence::Int)
           if Base.operator_precedence(:*) <= precedence
               print(io, "(")
               show(io, z)
               print(io, ")")
           else
               show(io, z)
           end
       end

julia> :($a^2)
:((3.0 * exp(4.0im)) ^ 2)
```

The method defined above adds parentheses around the call to `show` when the precedence of the calling operator is higher than or equal to the precedence of multiplication. This check allows expressions which parse correctly without the parentheses (such as `:($a + 2)` and `:($a == 2)`) to omit them when printing:

```julia
julia> :($a + 2)
:(3.0 * exp(4.0im) + 2)

julia> :($a == 2)
:(3.0 * exp(4.0im) == 2)
```

## 「値の型」 / "Value Types"

Juliaでは、`true`や`false`などの**値**をディスパッチできません。 ただし、パラメトリック型でディスパッチすることはできますが、Juliaでは型パラメータとして型なしの値（型、シンボル、整数、浮動小数点数、タプルなど）を含めることができます。 一般的な例としては、`Array{T, N}`の次元数パラメータがあります。ここで`T`は型（例えば`Float64`）ですが、`N`はただの`Int`です。

値をパラメータとして使用する独自のカスタム型を作成し、それらを使用してカスタム型のディスパッチを制御することができます。 この考え方を説明するために、パラメトリック型の`Val{x}`とコンストラクタ`Val(x) = Val{x}()`を導入しましょう。このテクニックは、 より精巧な階層が必要です。

`Val`は次のように定義されます。

```julia
julia> struct Val{x}
       end

julia> Base.@pure Val(x) = Val{x}()
Val
```

これ以上`Val`の実装はありません。 Juliaの標準ライブラリのいくつかの関数は、`Val`インスタンスを引数として受け取り、独自の関数を書くために使うこともできます。 例えば：

```julia
julia> firstlast(::Val{true}) = "First"
firstlast (generic function with 1 method)

julia> firstlast(::Val{false}) = "Last"
firstlast (generic function with 2 methods)

julia> firstlast(Val(true))
"First"

julia> firstlast(Val(false))
"Last"
```

Juliaの一貫性を保つために、コールサイトはタイプを使用するのではなく、常に`foo(Val{:bar})`ではなく`foo(Val(:bar))`を使用するのではなく、`Val`*インスタンス*を渡す必要があります。

`Val`を含むパラメトリックな「値」型を誤って使用するのは非常に簡単だということは注目に値する。 不利なケースでは、コードのパフォーマンスを大幅に悪化させることになります。 特に、上記のように実際のコードを記述することは決してありません。 `Val`の適切な（そして不適切な）使い方の詳細については、パフォーマンスヒントの広範な議論を読んでください。

## 欠損値を含むかもしれない型: 欠損値を表現する / Nullable Types: Representing Missing Values

多くの設定では、存在する場合と存在しない場合の`T`型の値と対話する必要があります。
これらの設定を処理するために、Juliaは`Nullable{T}`というパラメトリック型を提供します。
これは、ゼロまたは1つの値を含む特殊なコンテナ型と考えることができます。
`Nullable{T}`は、欠損値とのやりとりが安全であることを保証するための最小限のインターフェースを提供します。 現在、インタフェースはいくつかの相互作用から成り立っています。
- `Nullable`オブジェクトを作る。
- `Nullable`オブジェクトが欠測値を持つかどうか調べる。
- `Nullable`オブジェクトの値がないときに`NullException`が投げられることを保証してその`Nullable`オブジェクトの値にアクセスする。
- `Nullable`オブジェクトの値がないときに型`T`のデフォルトの値が返されることを保証してその`Nullable`オブジェクトの値にアクセスする。
- `Nullable`オブジェクトの値（存在する場合）に操作を実行し、`Nullable`結果を取得します。 元の値がない場合、結果は失われます。
- `Nullable`オブジェクトの値（存在する場合）のテストを実行し、`Nullable`自体が存在しないか、テストに失敗した場合に欠落した結果を取得します。
- 単一の`Nullable`オブジェクトに対して一般的な操作を実行し、欠落したデータを伝播します。

### `Nullable`オブジェクトを作る

型`T`の欠損値を表すオブジェクトを作成するには、`Nullable{T}（）`関数を使用します：

```julia
julia> x1 = Nullable{Int64}()
Nullable{Int64}()

julia> x2 = Nullable{Float64}()
Nullable{Float64}()

julia> x3 = Nullable{Vector{Int64}}()
Nullable{Array{Int64,1}}()
```

型`T`の欠損値を表すオブジェクトを構築するには、`Nullable（x :: T）`関数を使用します：

```julia
julia> x1 = Nullable(1)
Nullable{Int64}(1)

julia> x2 = Nullable(1.0)
Nullable{Float64}(1.0)

julia> x3 = Nullable([1, 2, 3])
Nullable{Array{Int64,1}}([1, 2, 3])
```

`Nullable`オブジェクトを構築する2つの方法の中核的な違いに注目してください。
あるスタイルでは、関数パラメータとして型`T`を指定します。 他のスタイルでは、`T`型の単一の値を引数として指定します。

### `Nullable`オブジェクトが値を持つかどうか調べる

`Nullable`オブジェクトが値を持つかどうかは`isnull`を使って調べられます：

```julia
julia> isnull(Nullable{Float64}())
true

julia> isnull(Nullable(0.0))
false
```

### `Nullable`オブジェクトの値に安全にアクセスする

`Nullable`オブジェクトの値に`get`を使うことで安全にアクセスできます。

```julia
julia> get(Nullable{Float64}())
ERROR: NullException()
Stacktrace:
[...]

julia> get(Nullable(1.0))
1.0
```

値が存在しない場合、`Nullable {Float64}`の場合と同様に、`NullException`エラーがスローされます。
`get`関数のエラースローの性質は、欠損値にアクセスしようとする試みがすぐに失敗することを保証します。

`Nullable`オブジェクトの値が欠落していることが判明したときに使用できる合理的なデフォルト値が存在する場合は、このデフォルト値を`get`の第2引数として指定できます。

```julia
julia> get(Nullable{Float64}(), 0.0)
0.0

julia> get(Nullable(1.0), 0.0)
1.0
```

Tip

パフォーマンスを低下させる可能性のある型の不安定さを避けるために、`get`と`Nullable`オブジェクトのデフォルト値の型が一致していることを確認してください。
必要に応じて`convert`を手動で使用してください。

### `Nullable`オブジェクトについての操作

`Nullable`オブジェクトは、そらく失われている値を表します。
これらのオブジェクトを使用してすべてのコードを書き込むには、値が`isnull`で欠落していないかどうかを確認してから、適切な処置を行ってください。
しかし、コードがより高次の関数を使用してより簡潔または明確になる可能性のある一般的な使用例がいくつかあります。

map関数は、引数として関数fとNullable値xをとります。 Nullableを生成します。

- もし`x`が欠損値ならば、`x`は欠損値を生成する。
- もし`x`が値を持つならば、`x`は`f(get(x))`を値として含む`Nullable`を生成する。

これは、欠落している値を単純に伝播することが望ましい場合に、欠損している可能性のある値に対して簡単な操作を実行する場合に便利です。

`filter`関数は、述語関数`p`（つまりブール値を返す関数）と`Nullable`値`x`を引数としてとります。 これは`Nullable`値を生成します：

- `x`が欠損値なら、欠損値を生成する。
- `p(get(x))`が真なら、元の値`x`を生成する。
- `p(get(x))`が偽なら、欠損値を生成する。

このように、`filter`は許容値のみを選択し、許容できない値を欠損値に変換するものと考えることができます。

特定のケースではマップとフィルタは便利ですが、最も有用な高次関数はブロードキャストであり、既存の演算を動作させたりNullableを伝播させるなど、さまざまなケースを処理できます。
例は放送の必要性を促すでしょう。
二次方程式の2つの実数のうち大きい方を計算する関数があるとします。

```julia
julia> root(a::Real, b::Real, c::Real) = (-b + √(b^2 - 4a*c)) / 2a
root (generic function with 1 method)
```

期待していたように、`root(1, -9, 20)`の結果が`5.0`であることを検証できます。なぜなら、`5.0`はが2次方程式の2つの実際の根のうちの大きい方だからです。

例えば、係数が欠損しているかもしれない二次方程式の最大の実数解を探しているとします。現実世界のデータではデータセットが欠損値を含む可能性があるので対処できるようにする必要があります。しかし、方程式の全ての係数が分からなければ解を見つけられません。これに対しての最良の解決方法は、特定のユースケースに依存します。おそらく私たちはエラーを投げるべきです。ただし、この例では、欠落値を前方に伝播することが最善の解決策であると仮定します。つまり、入力が欠落している場合は、単に欠落した出力が生成されます。

`broadcast`関数はこの作業を容易にします。 `broadcast`に書き込んだ`root`関数を単純に渡すことができます：

```julia
julia> broadcast(root, Nullable(1), Nullable(-9), Nullable(20))
Nullable{Float64}(5.0)

julia> broadcast(root, Nullable(1), Nullable{Int}(), Nullable{Int}())
Nullable{Float64}()

julia> broadcast(root, Nullable{Int}(), Nullable(-9), Nullable(20))
Nullable{Float64}()
```

1つまたは複数の入力が欠けていると、`broadcast`の出力が失われます。

特別な糖衣構文として、ドット表記を使った`broadcast`関数があります：

```julia
julia> root.(Nullable(1), Nullable(-9), Nullable(20))
Nullable{Float64}(5.0)
```

特に、通常の算術演算子は、`.`-prefixを付けた演算子を使って便利に`broadcast`することができます。

```julia
julia> Nullable(2) ./ Nullable(3) .+ Nullable(1.0)
Nullable{Float64}(1.66667)
```