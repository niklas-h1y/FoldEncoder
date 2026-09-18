# Unicode Fold Encoder 🚀

A high-efficiency standalone text compressor that packs **three standard characters into a single Unicode symbol**, reducing string lengths by up to 66%.

---

## 🔍 How It Works (The Core System)

The encoder treats standard text characters like digits in a custom **Base-96 number system** and maps the compressed results directly into the **CJK Unified Ideographs** (Chinese characters) Unicode block.

Here is the exact technical breakdown of the algorithm:

### 1. Character Mapping (Base-96)
The script targets standard text characters starting from space (`" "`, ASCII 32) up to character 127. By subtracting `32` from any character's code point, it scales the text into a clean numeric range between **0 and 95**.

### 2. The Encoding Math (`encode`)
The script processes your input text in **chunks of 3 characters** at a time:
1. It reads 3 text characters and converts them into values a, b, and c (each between 0–95).
2. It combines them mathematically using base-96 positional notation:  
   \[\text{Combined Value} = (a \times 9216) + (b \times 96) + c\]  
   *(Note: 9216 is 96²)*
3. It maps this unique value into the safe Unicode landscape by adding it to a fixed base point: **`0x4e00`** (the absolute start of the CJK Unicode block).
4. It outputs **one single character** representing all three original inputs!

*If your text length isn't perfectly divisible by 3, the script automatically pads the trailing ends with blank spaces so the equation never breaks.*

### 3. The Decoding Math (`decode`)
To reconstruct the original data, the script completely reverses the mathematical pipeline:
1. It extracts the character code point and subtracts the base identifier `0x4e00`.
2. It uses division floor operations and remainder math (`Math.floor` and `%`) to separate the giant combined integer back into the three distinct 0–95 values.
3. It adds `32` back to each value to return them to standard plain text.
4. It cleanly trims off any added padding spaces at the very end.

---

## 🛠️ Usage & Integration

This project is entirely standalone and requires zero external libraries or frameworks. The script structure is built directly into a single HTML text sheet for fast, local deployment.

👉 **[View the Complete Source Code (unicode-fold-encoder.md)](unicode-fold-encoder.md)**

---
*Note: This compressor works entirely locally in your client's web browser cache sandbox. No tracking, no data collection, no network overhead.*
