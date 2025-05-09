import { generateKeyPair, toHex } from "~/lib/crypto";

export default function Register() {
  const key = generateKeyPair();

  return (
    <div class="container p-4 mx-auto h-screen">
      public key : {toHex(key.publicKey)}
      <br />
      private key : {toHex(key.privateKey)}
    </div>
  );
}
