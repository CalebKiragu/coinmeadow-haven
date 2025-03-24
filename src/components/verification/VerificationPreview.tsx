import { Button } from "@/components/ui/button";

interface VerificationPreviewProps {
  data: any;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const VerificationPreview = ({
  data,
  onEdit,
  onSubmit,
  isSubmitting,
}: VerificationPreviewProps) => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Title */}
      <h2 className="text-xl font-extrabold text-justify text-black">
        Review Your Information
      </h2>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Personal Information
          </h3>
          <div className="space-y-1 text-gray-600">
            <p>
              <span className="font-medium">First Name:</span> {data.firstName}
            </p>
            <p>
              <span className="font-medium">Surname:</span> {data.lastName}
            </p>
            <p>
              <span className="font-medium">ID/Passport Number:</span>{" "}
              {data.govId}
            </p>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Uploaded Documents
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium">Selfie</p>
              <img
                src={data.selfie}
                alt="Selfie preview"
                className="w-20 h-20 rounded-md object-cover shadow-md border"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">ID Front</p>
              <img
                src={data.idFront}
                alt="ID Front preview"
                className="w-20 h-20 rounded-md object-cover shadow-md border"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">ID Back</p>
              <img
                src={data.idBack}
                alt="ID Back preview"
                className="w-20 h-20 rounded-md object-cover shadow-md border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Button
          variant="outline"
          onClick={onEdit}
          className="px-6 py-2 rounded-lg border-gray-400 text-gray-700 hover:bg-gray-100 transition"
        >
          Edit Information
        </Button>
        <Button
          onClick={onSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default VerificationPreview;
