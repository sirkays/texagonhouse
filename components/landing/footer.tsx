import {Mail, Phone, MapPin} from "lucide-react";
import {getBrandConfig} from "@/lib/brand";

export function Footer() {
  const brand = getBrandConfig();

  return (
    <footer className="relative z-10 px-6 py-12 lg:px-12 lg:py-16 bg-accent/30 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {brand.fullName}
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {brand.subTagline} — {brand.tagline}.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  Portal Login
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{brand.supportEmail}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{brand.supportPhone}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{brand.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{brand.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

