import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProductSuggest = () => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Sản phẩm tương tự</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-4"></CardContent>
    </Card>
  );
};
