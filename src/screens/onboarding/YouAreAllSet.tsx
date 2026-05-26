import rentanoImg from "../../imports/No_back_rentano.png";
import { PwaInstallBanner } from "../../components/PwaInstallBanner";
import { usePwaInstallPrompt } from "../../hooks/PwaInstallProvider";
import { BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";

type YouAreAllSetProps = {
  onContinue: () => void;
};

export function YouAreAllSet({ onContinue }: YouAreAllSetProps) {
  const pwa = usePwaInstallPrompt();

  return (
    <div className="screen mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <img
          src={rentanoImg}
          alt=""
          className="mb-6 h-32 w-32 object-contain"
          draggable={false}
        />
        <h1 className="text-2xl font-bold" style={{ color: BRAND_GREEN }}>
          You are all set!
        </h1>
        <p className="mt-3 max-w-[280px] text-base leading-relaxed text-gray-500">
          Your area is saved. Browse rentals near you or list something to earn.
        </p>
      </div>

      <footer className="shrink-0 border-t border-gray-100 px-4 pb-6 pt-4">
        {pwa.visible ? (
          <div className="mb-4">
            <PwaInstallBanner
              compact
              nativeInstallReady={pwa.nativeInstallReady}
              manualIos={pwa.manualIos}
              onInstall={() => void pwa.install()}
              onDismiss={pwa.dismiss}
            />
          </div>
        ) : null}
        <button
          type="button"
          onClick={onContinue}
          className="btn-primary w-full font-bold text-white"
          style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
        >
          Go to Home Feed →
        </button>
      </footer>
    </div>
  );
}
