import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
          <div className="max-w-md space-y-4 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold">NexusPay UI Recovered</h2>
            <p className="text-xs text-slate-300">
              حدث خطأ مؤقت في عرض الواجهة. اضغط الزر أدناه لإعادة تحديث الصفحة.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl text-left font-mono text-[11px] text-rose-400 overflow-x-auto max-h-40 border border-rose-500/20">
                <div className="font-bold">{this.state.error.toString()}</div>
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              إعادة تحميل المنصة (Reload Platform)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
