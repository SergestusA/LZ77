function compress() {
    const inputString = document.getElementById('lz77-input').value;

    const compressedResult = lz77.compress(inputString);

    let outputString = '';

    // Объединяем символы и пары (смещение, длина) в вывод
    for (const item of compressedResult) {
        if (item.length === 0) {
            outputString += item.next;
        } else {
            outputString += `<${item.offset},${item.length}>`;
        }
    }

    document.getElementById('lz77-output').textContent = outputString;
}

function decompress() {
    console.log("Decompressing...");
    const compressedString = document.getElementById('lz77-decode-input').value;

    console.log("Compressed string:", compressedString);

    const decompressedString = lz77.decompress(compressedString);

    console.log("Decompressed string:", decompressedString);

    document.getElementById('lz77-decoded').textContent = decompressedString;
}

class LZ77 {
    constructor(windowSize = 20, lookAheadBufferSize = 15) {
        this.windowSize = windowSize;
        this.lookAheadBufferSize = lookAheadBufferSize;
    }

    compress(input) {
        const output = [];
        let pos = 0;

        while (pos < input.length) {
            const { offset, length } = this.findLongestMatch(input, pos);
            if (length >= 2) {
                output.push({ offset, length });
                pos += length;
            } else {
                output.push({ length: 0, next: input[pos] });
                pos++;
            }
        }

        return output;
    }

    decompress(compressedString) {
        let result = '';

        const tokens = compressedString.match(/<(\d+),(\d+)>|[^<]+/g);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.startsWith('<')) {
                const [offset, length] = token.slice(1, -1).split(',').map(Number);
                result += result.substr(-offset, length);
            } else {
                result += token;
            }
        }

        return result;
    }

    findLongestMatch(data, currentPosition) {
        const endOfBuffer = Math.min(currentPosition + this.lookAheadBufferSize, data.length);
        const searchBufferStart = Math.max(0, currentPosition - this.windowSize);
        const searchBuffer = data.substring(searchBufferStart, currentPosition);

        let bestMatch = { offset: 0, length: 0 };

        for (let i = 0; i < searchBuffer.length; i++) {
            let matchLength = 0;
            let j = 0;

            while (
                searchBuffer[i + j] &&
                data[currentPosition + j] &&
                searchBuffer[i + j] === data[currentPosition + j] &&
                j < this.lookAheadBufferSize
            ) {
                matchLength++;
                j++;
            }

            if (matchLength > bestMatch.length && currentPosition - (searchBufferStart + i) > 0) {
                bestMatch = {
                    offset: currentPosition - (searchBufferStart + i),
                    length: matchLength,
                };
            }
        }

        return bestMatch;
    }
}

const lz77 = new LZ77();
