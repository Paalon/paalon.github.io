using Plots

x = 0.0:0.1:10.0
y = sin.(x)

pyplot()
plot(x, y)
savefig("test-pyplot.png")
plot(x, y)
savefig("test-pyplot.pdf")

gr()
plot(x, y)
savefig("test-gr.png")
plot(x, y)
savefig("test-gr.pdf")

plotlyjs()
plot(x, y)
savefig("test-plotlyjs.png")
plot(x, y)
savefig("test-plotlyjs.pdf")

inspectdr()
plot(x, y)
savefig("test-plotlyjs.png")
plot(x, y)
savefig("test-plotlyjs.pdf")