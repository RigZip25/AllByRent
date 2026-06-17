import { Component, type ErrorInfo, type ReactNode } from "react";
import { APP_NAME } from "../../lib/brand";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[${APP_NAME}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F2] p-6 text-center">
          <h1 className="mb-2 text-[20px] font-bold text-[#0D5C3A]">Something went wrong</h1>
          <p className="mb-4 max-w-[320px] text-[14px] text-gray-600">
            {this.state.error.message}
          </p>
          <button
            type="button"
            className="mb-3 rounded-xl bg-[#0D5C3A] px-6 py-3 text-[15px] font-bold text-white"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload app
          </button>
          <button
            type="button"
            className="text-[13px] text-gray-500 underline"
            onClick={() => {
              try {
                localStorage.removeItem("allbyrent_rental_bookings");
                localStorage.removeItem("allbyrent_rental_bookings_version");
                localStorage.removeItem("allbyrent_user_profile");
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
          >
            Reset demo data &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
