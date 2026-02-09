# Circuit-Chan Vision Brain: AR Circuit Debugger

Circuit-Chan Vision is an AR-powered electronics engineer that acts as a "second pair of eyes" for debugging breadboards and PCBs. Using Gemini's multimodal vision, it visually identifies components, predicts logic states, and detects wiring faults in real-time.

## 🚀 Features
- **AR Breadboard Analysis**: Instantly identifies ICs, resistors (via color bands), LEDs, and capacitors.
- **Logic State Recognition**: Uses advanced vision patterns to identify logic gate configurations (e.g., `AND_01_Out0`).
- **Real-Time Fault Detection**: Highlights loose wires, polarity errors, and incorrect pin placements with precise AR markers.
- **Deep Component Intelligence**: Provides pinouts, internal physics descriptions, and direct links to datasheets for detected parts.

## 🧠 Brain Logic
Instead of a static model, Circuit-Chan uses a **Dataset-Informed Prompt Template** optimized for the Gemini 3 Flash multimodal engine. This allows for flexible, high-fidelity reasoning over visual circuit data without the overhead of fixed fine-tuning.

## 🛠️ Built With
- **Language**: TypeScript
- **Framework**: React + Vite
- **AI Engine**: Google Gemini (Google Gen AI SDK)
- **UI Icons**: Lucide React

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Blessy27-CSBS/Circuit-Chan-AR-Debugger.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file and add your Gemini API key:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 👩‍🔬 Inspiration
Electronics debugging is often a tedious process. We built Circuit-Chan to acting as a high-fidelity diagnostic engine, turning a simple camera into a Lead Engineer's visual toolkit.

---
Built with ❤️ for the Gemini 3 Hackathon.
