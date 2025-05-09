import { generateKeyPair, toHex } from "~/lib/crypto";

export default function Register() {
  const key = generateKeyPair();

  return (
    <div>
      public key : {toHex(key.publicKey)}
      <br />
      private key : {toHex(key.privateKey)}
    </div>
  );
}
