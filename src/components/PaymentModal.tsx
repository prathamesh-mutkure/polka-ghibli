import React from "react";

interface PaymentModalProps {
  price: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  price,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Create Your Ghibli NFT</h3>

        <p className="mb-6 text-gray-600">
          Your image will be transformed into a beautiful Ghibli-style animated
          NFT. This process will cost {price} ETH (approximately $1).
        </p>

        <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4 mb-6">
          <h4 className="font-medium text-indigo-800 mb-2">What you'll get:</h4>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• Professionally animated Ghibli-style illustration</li>
            <li>• Unique NFT minted on Polkadot's EVM chain</li>
            <li>• Full ownership rights to your creation</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Pay {price} ETH
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
