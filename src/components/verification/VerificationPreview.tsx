import { Button } from "@/components/ui/button";

interface VerificationPreviewProps {
  data: any;
  onEdit: () => void;
  onSubmit: () => void;
}

const VerificationPreview = ({ data, onEdit, onSubmit }: VerificationPreviewProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Your Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Personal Information</h3>
          <p>First Name: {data.firstName}</p>
          <p>Surname: {data.surname}</p>
          <p>ID/Passport Number: {data.idNumber}</p>
        </div>
        
        <div>
          <h3 className="font-medium">Uploaded Documents</h3>
          <p>Selfie: {data.selfie?.name}</p>
          <p>ID Front: {data.idFront?.name}</p>
          <p>ID Back: {data.idBack?.name}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onEdit}>Edit Information</Button>
        <Button onClick={onSubmit}>Submit for Verification</Button>
      </div>
    </div>
  );
};

export default VerificationPreview;