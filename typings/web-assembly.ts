declare namespace WebAssembly {
	interface MemoryInitializer {
		initial?: number
		maximum?: number
	}
	class Memory {
		readonly buffer: ArrayBuffer
		constructor(params: MemoryInitializer)
	}
	class Module {
		constructor(buffer: ArrayBuffer | Uint8Array)
	}
	class Instance {
		constructor(module: Module)
	}
}