import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

type LightboxImage = {
  readonly src: string;
  readonly alt: string;
};

export default function ImageLightbox() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest<HTMLImageElement>("[data-lightbox]");

      if (!trigger) {
        return;
      }

      event.preventDefault();
      setImage({
        src: trigger.dataset.lightboxSrc || trigger.src,
        alt: trigger.alt || "",
      });
      setOpen(true);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!open || !window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let startY = 0;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      startY = touch.clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const deltaY = touch.clientY - startY;

      if (deltaY > 100) {
        setOpen(false);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[95vh] max-w-[95vw] border-0 bg-transparent p-0 shadow-none"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{image?.alt || "Image"}</DialogTitle>
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            className="h-auto max-h-[90vh] w-full object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
