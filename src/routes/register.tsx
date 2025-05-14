import { generateKeyPair, toHex } from "../../utils/crypto";

export default function Register() {
  const key = generateKeyPair();

  return (
    <div>
      public key : {toHex(key.publickey)}
      <br />
      private key : {toHex(key.privateKey)}
    </div>
  );
}
