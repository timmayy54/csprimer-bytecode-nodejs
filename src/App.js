import React, { useState } from 'react';
import './App.css';

function App() {
    const [memory, setMemory] = useState(Array(256).fill(0));
    const [program, setProgram] = useState(`load r1 1\nload r2 2\nadd r1 r2\nstore r1 0\nhalt`);
    const [currentLine, setCurrentLine] = useState(0);
    const [output, setOutput] = useState([]);

    const handleChange = (e, index) => {
        const newMemory = [...memory];
        newMemory[index] = parseInt(e.target.value, 10) || 0;
        setMemory(newMemory);
    };

    const handleProgramChange = (e) => {
        setProgram(e.target.value);
    };

    const parseInstruction = (instruction) => {
        const parts = instruction.trim().split(' ');
        const op = parts[0].toUpperCase();
        const reg1 = parts[1] ? parts[1].toLowerCase() : null;
        const reg2 = parts[2] ? parts[2] : null;
        const imm = parts[2] ? parseInt(parts[2], 10) : null;

        switch (op) {
            case 'LOAD':
                return [0x01, reg1 === 'r1' ? 0x01 : 0x02, imm];
            case 'STORE':
                return [0x02, reg1 === 'r1' ? 0x01 : 0x02, imm];
            case 'ADD':
                return [0x03, reg1 === 'r1' ? 0x01 : 0x02, reg2 === 'r1' ? 0x01 : 0x02];
            case 'SUB':
                return [0x04, reg1 === 'r1' ? 0x01 : 0x02, reg2 === 'r1' ? 0x01 : 0x02];
            case 'HALT':
                return [0xff];
            case 'ADDI':
                return [0x05, reg1 === 'r1' ? 0x01 : 0x02, imm];
            case 'SUBI':
                return [0x06, reg1 === 'r1' ? 0x01 : 0x02, imm];
            case 'JUMP':
                return [0x07, imm];
            case 'BEQZ':
                return [0x08, reg1 === 'r1' ? 0x01 : 0x02, imm];
            default:
                throw new Error(`Invalid operation: ${op}`);
        }
    };

    const loadProgram = () => {
        const instructions = program.split('\n');
        const parsedProgram = instructions.map(parseInstruction);
        const newMemory = [...memory];
        // Load instructions starting from address 8
        for (let i = 0; i < parsedProgram.length; i++) {
            newMemory[i + 8] = parsedProgram[i];
        }
        setMemory(newMemory);
        setOutput([...output, 'Program loaded into memory:', ...parsedProgram.map(inst => inst.join(' '))]);
        setCurrentLine(8); // Set current line to the start of instructions
    };

    const executeLine = () => {
        const newMemory = [...memory];
        if (currentLine < newMemory.length) {
            const instruction = newMemory[currentLine];
            let description = '';
            switch (instruction[0]) {
                case 0x01:
                    description = `Load operation put the value ${toHex(instruction[2])} into register 1.`;
                    newMemory[1] = instruction[2];
                    break;
                case 0x02:
                    description = `Store operation stored the value from register 1 into memory address ${toHex(instruction[2])}.`;
                    newMemory[instruction[2]] = newMemory[1];
                    break;
                case 0x03:
                    description = `Add operation added the values of register 1 and register 2.`;
                    newMemory[0] = newMemory[1] + newMemory[2];
                    break;
                case 0xff:
                    description = 'Halt operation executed.';
                    break;
                default:
                    description = 'Unknown operation.';
            }
            setMemory(newMemory);
            setOutput([...output, description]);
            setCurrentLine(currentLine + 1);
        }
    };

    const toHex = (value) => {
        return value.toString(16).padStart(2, '0');
    };

    return (
        <div className="App">
            <div className="left-column">
                <h2>Enter Program</h2>
                <textarea value={program} onChange={handleProgramChange} rows={10} cols={30} />
                <button onClick={loadProgram}>Load Program</button>
                <button onClick={executeLine}>Execute Next Line</button>
                <h2>Input Memory (First 8 Bytes)</h2>
                <table>
                    <tbody>
                        {memory.slice(0, 8).map((val, index) => (
                            <tr key={index}>
                                <td>Address {toHex(index)}</td>
                                <td>{toHex(val)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h2>Output</h2>
                <div className="output">
                    {output.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>
            <div className="right-column">
                <h2>Registers</h2>
                <p>Program Counter (PC): {toHex(currentLine)}</p>
                <p>Register 1 (R1): {toHex(memory[1])}</p>
                <p>Register 2 (R2): {toHex(memory[2])}</p>
                <h2>Input Memory (Remaining Bytes)</h2>
                <table>
                    <tbody>
                        {memory.slice(8).map((val, index) => (
                            <tr key={index + 8}>
                                <td>Address {toHex(index + 8)}</td>
                                <td>{toHex(val)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function reg(s) {
    return {'r1': 0x01, 'r2': 0x02}[s];
}

function mem(s) {
    return parseInt(s) & 0xFF;
}

function imm(s) {
    return mem(s);
}

function assemble(asm) {
    const mc = [];
    asm = asm.trim();
    for (const line of asm.split('\n')) {
        const parts = line.trim().split(' ');
        if (!parts.length) continue;
        const op = parts[0];
        if (op === 'load') {
            mc.push(0x01, reg(parts[1]), mem(parts[2]));
        } else if (op === 'store') {
            mc.push(0x02, reg(parts[1]), mem(parts[2]));
        } else if (op === 'add') {
            mc.push(0x03, reg(parts[1]), reg(parts[2]));
        } else if (op === 'sub') {
            mc.push(0x04, reg(parts[1]), reg(parts[2]));
        } else if (op === 'addi') {
            mc.push(0x05, reg(parts[1]), imm(parts[2]));
        } else if (op === 'subi') {
            mc.push(0x06, reg(parts[1]), imm(parts[2]));
        } else if (op === 'jump') {
            mc.push(0x07, imm(parts[1]));
        } else if (op === 'beqz') {
            mc.push(0x08, reg(parts[1]), imm(parts[2]));
        } else if (op === 'halt') {
            mc.push(0xff);
        } else {
            throw new Error(`Invalid operation: ${op}`);
        }
    }
    return mc;
}

export default App;
