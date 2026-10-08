# Contributing to VectorShield

Thank you for your interest in contributing to **VectorShield**! As an enterprise-grade defense platform, we welcome pull requests for new attack vectors, algorithm optimizations, documentation, and test fixtures.

---

## 1. Code of Conduct

All contributors and maintainers are expected to adhere to our standard professional community guidelines: respect, technical rigor, constructive code review, and responsible security ethics.

---

## 2. Development Setup

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & `npm`
* Git

### Local Environment Initialization

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chinmayimagdum12/VectorShield.git
   cd VectorShield
   ```

2. **Setup Python Virtual Environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r backend/requirements.txt
   ```

3. **Setup Frontend Workspace**:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Launch Development Application**:
   ```bash
   python start_app.py
   ```
   Open `http://localhost:8000` in your browser.

---

## 3. Pull Request Guidelines

1. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Write unit tests** for any new defense detectors or pipeline stages:
   ```bash
   pytest tests/
   ```
3. **Verify frontend integrity**:
   ```bash
   cd frontend && npm run build
   ```
4. **Submit PR** with:
   * Clear title and summary of changes
   * Test evidence (terminal logs or benchmark output)
   * Impact on defensive latency budget (<25ms total P50 required)
