import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReturnProductModal from "./ReturnProductModal";
import * as client from "@/api/client";

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

vi.mock("@/context/ToastContext", () => ({
  useToast: () => mockToast,
}));

describe("ReturnProductModal - Mandatory 1 Video & Optional Min 3 Pictures", () => {
  const mockOrder = {
    orderId: "ORD-9901",
    totalAmount: 2500,
    profit: 500,
    cart: [
      {
        itemId: "item-1",
        quantity: 1,
        selectedSize: "L",
        selectedColor: "Black",
        product: {
          productId: "prod-101",
          name: "Smart Fitness Tracker Watch",
          price: 2500,
          images: ["https://example.com/watch.jpg"],
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(client, "post").mockResolvedValue({
      message: "Return request submitted successfully.",
      order: { orderId: "ORD-9901", status: "Returned" },
    });
  });

  it("renders 1 Video Proof as mandatory and Defect Pictures as optional with mini 3 requirement", () => {
    render(
      <ReturnProductModal
        open={true}
        order={mockOrder}
        onClose={vi.fn()}
        onSubmitSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/Return Defective Product/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 Video Proof/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Must add 1 video/i)).toBeInTheDocument();
    expect(screen.getByText(/Defect Pictures/i)).toBeInTheDocument();
    expect(screen.getByText(/Option: Mini 3 Pictures/i)).toBeInTheDocument();
    expect(screen.getByText(/0 photos attached/i)).toBeInTheDocument();
  });

  it("shows error and blocks submit if video proof is missing", async () => {
    render(
      <ReturnProductModal
        open={true}
        order={mockOrder}
        onClose={vi.fn()}
        onSubmitSuccess={vi.fn()}
      />
    );

    // Enter description
    const descInput = screen.getByPlaceholderText(/Explain the defect/i);
    fireEvent.change(descInput, { target: { value: "Display screen is not turning on." } });

    // Click submit without adding video
    const submitBtn = screen.getByRole("button", { name: /Submit Return Request/i });
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringMatching(/Please add 1 video proof of the defective product/i)
    );
    expect(client.post).not.toHaveBeenCalled();
  });

  it("blocks submit if 1 or 2 pictures are attached (less than 3 minimum)", async () => {
    render(
      <ReturnProductModal
        open={true}
        order={mockOrder}
        onClose={vi.fn()}
        onSubmitSuccess={vi.fn()}
      />
    );

    // Enter description
    const descInput = screen.getByPlaceholderText(/Explain the defect/i);
    fireEvent.change(descInput, { target: { value: "Screen damaged upon delivery." } });

    // Add video via paste link
    const pasteVideoBtn = screen.getByRole("button", { name: /Paste Link/i });
    fireEvent.click(pasteVideoBtn);
    const videoInput = screen.getByPlaceholderText(/Paste video link/i);
    fireEvent.change(videoInput, { target: { value: "https://www.youtube.com/watch?v=mock123" } });

    // Switch photo mode to Paste URL and add 1 photo
    const pastePhotoBtn = screen.getByRole("button", { name: /Paste URL/i });
    fireEvent.click(pastePhotoBtn);
    const photoInput = screen.getByPlaceholderText(/Paste image URL/i);
    fireEvent.change(photoInput, { target: { value: "https://example.com/defect1.jpg" } });
    const addPhotoBtn = screen.getByRole("button", { name: /Add/i });
    fireEvent.click(addPhotoBtn);

    // Check status bar shows 1 / 3 min warning
    expect(screen.getByText(/1 \/ 3 min photos added/i)).toBeInTheDocument();

    // Click submit
    const submitBtn = screen.getByRole("button", { name: /Submit Return Request/i });
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringMatching(/minimum of 3 pictures is required/i)
    );
    expect(client.post).not.toHaveBeenCalled();
  });

  it("successfully submits with 1 video and 0 pictures (pictures are optional)", async () => {
    const onSuccess = vi.fn();
    render(
      <ReturnProductModal
        open={true}
        order={mockOrder}
        onClose={vi.fn()}
        onSubmitSuccess={onSuccess}
      />
    );

    // Enter description
    const descInput = screen.getByPlaceholderText(/Explain the defect/i);
    fireEvent.change(descInput, { target: { value: "Device does not boot." } });

    // Add 1 video
    const pasteVideoBtn = screen.getByRole("button", { name: /Paste Link/i });
    fireEvent.click(pasteVideoBtn);
    const videoInput = screen.getByPlaceholderText(/Paste video link/i);
    fireEvent.change(videoInput, { target: { value: "https://www.youtube.com/watch?v=videoProof" } });

    // Submit with 0 pictures
    const submitBtn = screen.getByRole("button", { name: /Submit Return Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledTimes(1);
    });

    expect(client.post).toHaveBeenCalledWith(
      "/orders/ORD-9901/return",
      expect.objectContaining({
        orderId: "ORD-9901",
        videoUrl: "https://www.youtube.com/watch?v=videoProof",
        images: [],
      })
    );
  });

  it("successfully submits with 1 video and 3 pictures", async () => {
    const onSuccess = vi.fn();
    render(
      <ReturnProductModal
        open={true}
        order={mockOrder}
        onClose={vi.fn()}
        onSubmitSuccess={onSuccess}
      />
    );

    // Enter description
    const descInput = screen.getByPlaceholderText(/Explain the defect/i);
    fireEvent.change(descInput, { target: { value: "Device cracked and defect confirmed." } });

    // Add 1 video
    const pasteVideoBtn = screen.getByRole("button", { name: /Paste Link/i });
    fireEvent.click(pasteVideoBtn);
    const videoInput = screen.getByPlaceholderText(/Paste video link/i);
    fireEvent.change(videoInput, { target: { value: "https://example.com/video.mp4" } });

    // Add 3 pictures
    const pastePhotoBtn = screen.getByRole("button", { name: /Paste URL/i });
    fireEvent.click(pastePhotoBtn);
    const photoInput = screen.getByPlaceholderText(/Paste image URL/i);
    const addPhotoBtn = screen.getByRole("button", { name: /Add/i });

    fireEvent.change(photoInput, { target: { value: "https://example.com/pic1.jpg" } });
    fireEvent.click(addPhotoBtn);

    fireEvent.change(photoInput, { target: { value: "https://example.com/pic2.jpg" } });
    fireEvent.click(addPhotoBtn);

    fireEvent.change(photoInput, { target: { value: "https://example.com/pic3.jpg" } });
    fireEvent.click(addPhotoBtn);

    expect(screen.getByText(/3 photos attached/i)).toBeInTheDocument();

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Submit Return Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledTimes(1);
    });

    expect(client.post).toHaveBeenCalledWith(
      "/orders/ORD-9901/return",
      expect.objectContaining({
        orderId: "ORD-9901",
        videoUrl: "https://example.com/video.mp4",
        images: [
          "https://example.com/pic1.jpg",
          "https://example.com/pic2.jpg",
          "https://example.com/pic3.jpg",
        ],
      })
    );
  });
});
