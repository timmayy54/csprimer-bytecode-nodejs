function compute(memory) {
  const registers = [8, 0, 0]; // PC, R1, R2
  let pc = registers[0];
  while (true) {
    const opcode = memory[pc];
    if (opcode === 0xff) break; // Halt
    const arg1 = memory[pc + 1];
    const arg2 = memory[pc + 2];
    if (opcode === 0x01) {
      registers[arg1] = memory[arg2]; // LOAD
    } else if (opcode === 0x02) {
      memory[arg2] = registers[arg1]; // STORE
    } else if (opcode === 0x03) {
      registers[arg1] = (registers[arg1] + registers[arg2]) & 0xff; // ADD
    } else if (opcode === 0x04) {
      registers[arg1] = (registers[arg1] - registers[arg2]) & 0xff; // SUB
    } else if (opcode === 0x05) {
      registers[arg1] = (registers[arg1] + arg2) & 0xff; // ADDI
    } else if (opcode === 0x06) {
      registers[arg1] = (registers[arg1] - arg2) & 0xff; // SUBI
    } else if (opcode === 0x07) {
      registers[0] = arg1; // JUMP
      continue;
    } else if (opcode === 0x08 && registers[arg1] === 0) {
      registers[0] += arg2; // BEQZ
      continue;
    } else {
      throw new Error("Invalid opcode: " + opcode);
    }
    pc += 3; // Move to next instruction
  }
  return memory; // The memory has been modified
}
module.exports = { compute };
