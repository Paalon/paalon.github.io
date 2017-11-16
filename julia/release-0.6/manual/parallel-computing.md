# 並列計算

大半の現代のコンピュータプロセスは１つ以上のCPUを持ち、いくつかのコンピュータは１つのクラスターにまとめ上げることができます。

```julia
module DummyModule

export MyType, f

mutable struct MyType
	a::Int
end

f(x) = x^2+1

println("loaded")

end
```

Juliaを`julia -p 2`として起動すると、これを次を確かめるために使えます。

-   `include("DummyModule.jl")`はシングルプロセスについてだけファイルをロードする（どれがこの文を実行したとしても）。
-   `using DummyModule`はモジュールが全てのプロセスにロードされるようにする。しかし、モジュールは１角実行文についてだけのスコープに読み込まれる。
-   `DummyModule`がプロセス２番にロードされる限り、
```julia
rr = RemoteChannel(2)
put!(rr, MyType(7))
```
のようなコマンドは`DummyModule`がプロセス２番のスコープの中になくても、プロセス２番に`MyType`型のオブジェクトを保管しておくことができる。

`@everywhere`マクロを使うことによって全てのプロセスでコマンドを走らせることを強制できます。例えば、`@everywhere`を全てのプロセス上で関数を直接定義するのに使えます。

```julia
julia> @everywhere id = myid()

julia> remotecall_fetch(()->id, 2)
2
```

ファイルは開始時に複数のプロセス上でプリロードすることが可能で、起動スクリプトで計算を開始させることができます。

```bash
julia -p <n> -L file1.jl -L file2.jl driver.jl
```

Juliaのプロセスは