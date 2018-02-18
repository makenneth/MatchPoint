import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";

export default {
  generateToken: function(length = 32) {
    return URLSafeBase64.encode(crypto.randomBytes(length));
  },
};
