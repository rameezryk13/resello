import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileVideo,
  Image as ImageIcon,
  PackageCheck,
  PackageX,
  Store,
  Truck,
  Video,
  XCircle,
} from "lucide-react";
import { formatRupees } from "@/utils/currency";

const formatDate = (value) => {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ReturnClaimsView = ({
  historySectionFilter,
  setHistorySectionFilter,
  returnedOrders = [],
  inProgressReturns = [],
  acceptedReturns = [],
  rejectedReturns = [],
  updatingReturnId,
  onUpdateReturnStatus,
  computeOrderSettlement,
  wallet,
}) => {
  if (returnedOrders.length === 0) {
    return (
      <div className="return-empty-box">
        <PackageX size={48} className="text-muted" />
        <h3>No Return Requests Found</h3>
        <p>You haven't requested any returns on your delivered orders yet.</p>
      </div>
    );
  }

  return (
    <div className="returned-history-view">
      {/* Filter subnav pills */}
      <div className="return-history-subnav return-subnav-bar">
        <div className="return-subnav-pills return-subnav-bar">
          <button
            type="button"
            className={`return-subnav-pill subnav-pill ${historySectionFilter === "all" ? "active" : ""}`}
            onClick={() => setHistorySectionFilter("all")}
          >
            <span>All Claims</span>
            <span className="return-subnav-count">{returnedOrders.length}</span>
          </button>
          <button
            type="button"
            className={`return-subnav-pill subnav-pill in-progress ${historySectionFilter === "in_progress" ? "active" : ""}`}
            onClick={() => setHistorySectionFilter("in_progress")}
          >
            <Clock size={15} />
            <span>In Progress</span>
            <span className="return-subnav-count">{inProgressReturns.length}</span>
          </button>
          <button
            type="button"
            className={`return-subnav-pill subnav-pill accepted ${historySectionFilter === "accepted" ? "active" : ""}`}
            onClick={() => setHistorySectionFilter("accepted")}
          >
            <CheckCircle2 size={15} />
            <span>Accepted Claims</span>
            <span className="return-subnav-count">{acceptedReturns.length}</span>
          </button>
          <button
            type="button"
            className={`return-subnav-pill subnav-pill rejected ${historySectionFilter === "rejected" ? "active" : ""}`}
            onClick={() => setHistorySectionFilter("rejected")}
          >
            <XCircle size={15} />
            <span>Rejected</span>
            <span className="return-subnav-count">{rejectedReturns.length}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: IN PROGRESS RETURNS */}
      {(historySectionFilter === "all" || historySectionFilter === "in_progress") && (
        <div className="return-status-section in-progress">
          <div className="return-section-header in-progress">
            <div className="return-section-header-left">
              <div className="return-section-icon in-progress">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="return-section-title">
                  In Progress Return Requests
                  <span className="return-section-count-badge in-progress">
                    {inProgressReturns.length} Pending
                  </span>
                </h3>
                <p className="return-section-sub">
                  Defect claims currently under QA warehouse review and courier pickup scheduling.
                </p>
              </div>
            </div>
          </div>

          {inProgressReturns.length > 0 ? (
            <div className="returned-history-list">
              {inProgressReturns.map((order) => {
                const req = order.returnRequest;
                const isUpdating = updatingReturnId === order.orderId;
                const s = computeOrderSettlement(order, wallet.transactions || []);

                return (
                  <article key={order.orderId} className="returned-card in-progress">
                    <div className="returned-card-header">
                      <div>
                        <div className="returned-order-title">
                          <strong>Order #{order.orderId}</strong>
                          <span className="returned-status-badge in-progress">
                            <Clock size={13} /> In Progress / Under Review
                          </span>
                        </div>
                        <span className="returned-date">
                          Requested on {formatDate(req?.requestedAt || order.createdAt)}
                        </span>
                      </div>
                      <div className="returned-total-tag">
                        {formatRupees(order.totalAmount)}
                      </div>
                    </div>

                    {req ? (
                      <div className="returned-proof-summary">
                        <div className="returned-reason-row">
                          <AlertCircle size={16} className="text-warning" />
                          <div>
                            <strong>Claimed Defect Reason:</strong> {req.reason}
                            {req.description && <p>{req.description}</p>}
                          </div>
                        </div>

                        {/* Media Proof Preview */}
                        {req.mediaUrl && (
                          <div className="returned-media-attached-box">
                            <span className="returned-media-label">
                              {req.mediaType === "video" ? (
                                <>
                                  <Video size={14} /> Attached Video Proof
                                </>
                              ) : (
                                <>
                                  <ImageIcon size={14} /> Attached Picture Proof
                                </>
                              )}
                            </span>

                            {req.mediaType === "video" ? (
                              req.mediaUrl.startsWith("http") ? (
                                <a
                                  href={req.mediaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="returned-media-link"
                                >
                                  <FileVideo size={16} /> Open Video Proof{" "}
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <video
                                  src={req.mediaUrl}
                                  controls
                                  className="returned-preview-video"
                                />
                              )
                            ) : (
                              <img
                                src={req.mediaUrl}
                                alt="Defect proof"
                                className="returned-proof-thumb"
                              />
                            )}
                          </div>
                        )}

                        {/* Admin Financial Settlement Strip */}
                        <div className="order-admin-clearance-strip pending">
                          <div className="strip-left">
                            <Clock size={15} className="text-warning" />
                            <div>
                              <span className="strip-label">Admin Financial Status:</span>
                              <strong className="strip-amount pending">
                                {formatRupees(s.pendingTotal)} Pending from Admin
                              </strong>
                            </div>
                          </div>
                          <div className="strip-right">
                            <span className="strip-badge pending">Awaiting QA Clearance</span>
                            <span className="strip-hint">Order amount without commission (commission already given)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="returned-standard-note">
                        Marked as Returned. Return penalty recorded per policy.
                      </p>
                    )}

                    {/* Decision Simulator */}
                    <div className="return-decision-simulator-bar">
                      <span className="simulator-label">Review Decision (Demo Switcher):</span>
                      <div className="simulator-actions">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn vendor"
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Accepted",
                              "Vendor Mistake",
                              "Supplier manufacturing defect confirmed. Full refund credited to reseller wallet."
                            )
                          }
                        >
                          <Store size={13} /> Accept (Vendor Mistake)
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn shipping"
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Accepted",
                              "Shipping Mistake",
                              "Courier transit damage confirmed upon package inspection. Transit claim approved."
                            )
                          }
                        >
                          <Truck size={13} /> Accept (Shipping Mistake)
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn reject"
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Rejected",
                              undefined,
                              "Defect proof does not meet return eligibility criteria."
                            )
                          }
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="return-empty-section-card">
              <PackageCheck size={32} className="text-muted" />
              <p>No return requests are currently in progress.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ACCEPTED RETURNS */}
      {(historySectionFilter === "all" || historySectionFilter === "accepted") && (
        <div className="return-status-section accepted">
          <div className="return-section-header accepted">
            <div className="return-section-header-left">
              <div className="return-section-icon accepted">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="return-section-title">
                  Accepted Returns
                  <span className="return-section-count-badge accepted">
                    {acceptedReturns.length} Approved
                  </span>
                </h3>
                <p className="return-section-sub">
                  Orders accepted for return with verified reason and fault attribution (Vendor Mistake vs. Shipping Mistake).
                </p>
              </div>
            </div>
          </div>

          {acceptedReturns.length > 0 ? (
            <div className="returned-history-list">
              {acceptedReturns.map((order) => {
                const req = order.returnRequest;
                const isUpdating = updatingReturnId === order.orderId;
                const s = computeOrderSettlement(order, wallet.transactions || []);
                const isShippingMistake =
                  req?.mistakeType === "Shipping Mistake" ||
                  (req?.reason && String(req.reason).toLowerCase().includes("transit")) ||
                  (req?.reason && String(req.reason).toLowerCase().includes("damaged"));

                return (
                  <article key={order.orderId} className="returned-card accepted">
                    <div className="returned-card-header">
                      <div>
                        <div className="returned-order-title">
                          <strong>Order #{order.orderId}</strong>
                          <span className="returned-status-badge accepted">
                            <CheckCircle2 size={13} /> Return Accepted
                          </span>
                        </div>
                        <span className="returned-date">
                          Accepted on {formatDate(req?.acceptedAt || req?.requestedAt || order.createdAt)}
                        </span>
                      </div>
                      <div className="returned-total-tag">
                        {formatRupees(order.totalAmount)}
                      </div>
                    </div>

                    {/* Prominent Reason & Mistake Attribution Box */}
                    <div className="accepted-mistake-box-wrap">
                      {isShippingMistake ? (
                        <div className="accepted-mistake-card shipping">
                          <div className="accepted-mistake-header">
                            <div className="mistake-badge shipping">
                              <Truck size={15} />
                              <span>Shipping Mistake</span>
                            </div>
                            <span className="accepted-claim-tag shipping">
                              Courier Claim Approved · Replacement Covered
                            </span>
                          </div>

                          <div className="accepted-mistake-body">
                            <div className="accepted-mistake-reason-row">
                              <strong className="accepted-reason-label">Order Return Reason:</strong>
                              <span className="accepted-reason-value">{req?.reason || "Damaged / Broken in Transit"}</span>
                            </div>

                            <p className="accepted-mistake-explanation">
                              {req?.description
                                ? `Inspection Report: ${req.description}`
                                : "Verification Result: Package damaged during transit by courier partner. Transit damage claim verified and approved. Replacement product dispatched."}
                            </p>
                          </div>

                          <div className="accepted-mistake-footer">
                            <div className="accepted-attribution-tag">
                              <span>Fault Attribution:</span>
                              <strong>Courier / Logistics Partner</strong>
                            </div>
                            <div className="accepted-settlement-tag">
                              <span>Settlement:</span>
                              <strong>Zero Reseller Cost · Transit Insurance Covered</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="accepted-mistake-card vendor">
                          <div className="accepted-mistake-header">
                            <div className="mistake-badge vendor">
                              <Store size={15} />
                              <span>Vendor Mistake</span>
                            </div>
                            <span className="accepted-claim-tag vendor">
                              Full Wallet Refund Approved · Zero Penalty
                            </span>
                          </div>

                          <div className="accepted-mistake-body">
                            <div className="accepted-mistake-reason-row">
                              <strong className="accepted-reason-label">Order Return Reason:</strong>
                              <span className="accepted-reason-value">{req?.reason || "Defective / Quality Issue / Wrong Item"}</span>
                            </div>

                            <p className="accepted-mistake-explanation">
                              {req?.description
                                ? `Inspection Report: ${req.description}`
                                : "Verification Result: Supplier acknowledged defect/manufacturing issue upon warehouse check. 100% item cost credited back to reseller wallet."}
                            </p>
                          </div>

                          <div className="accepted-mistake-footer">
                            <div className="accepted-attribution-tag">
                              <span>Fault Attribution:</span>
                              <strong>Vendor / Supplier Manufacturing</strong>
                            </div>
                            <div className="accepted-settlement-tag">
                              <span>Settlement:</span>
                              <strong>Full Refund to Reseller · No Return Penalty</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Media Proof Preview if attached */}
                    {req?.mediaUrl && (
                      <div className="returned-media-attached-box">
                        <span className="returned-media-label">
                          {req.mediaType === "video" ? (
                            <>
                              <Video size={14} /> Verified Defect Video
                            </>
                          ) : (
                            <>
                              <ImageIcon size={14} /> Verified Defect Photo
                            </>
                          )}
                        </span>

                        {req.mediaType === "video" ? (
                          req.mediaUrl.startsWith("http") ? (
                            <a
                              href={req.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="returned-media-link"
                            >
                              <FileVideo size={16} /> View Attached Video Proof{" "}
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <video
                              src={req.mediaUrl}
                              controls
                              className="returned-preview-video"
                            />
                          )
                        ) : (
                          <img
                            src={req.mediaUrl}
                            alt="Defect proof"
                            className="returned-proof-thumb"
                          />
                        )}
                      </div>
                    )}

                    {/* Admin Financial Settlement Strip */}
                    <div className="order-admin-clearance-strip cleared">
                      <div className="strip-left">
                        <CheckCircle2 size={15} className="text-success" />
                        <div>
                          <span className="strip-label">Admin Financial Status:</span>
                          <strong className="strip-amount cleared">
                            {formatRupees(s.clearedTotal)} Cleared by Admin
                          </strong>
                        </div>
                      </div>
                      <div className="strip-right">
                        <span className="strip-badge cleared">Credited to Reseller Wallet</span>
                        <span className="strip-hint">
                          Order amount without commission (commission already given)
                        </span>
                      </div>
                    </div>

                    {/* Decision Simulator */}
                    <div className="return-decision-simulator-bar">
                      <span className="simulator-label">Review Decision (Demo Switcher):</span>
                      <div className="simulator-actions">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn in-progress"
                          onClick={() => onUpdateReturnStatus(order.orderId, "In Progress")}
                        >
                          <Clock size={13} /> Re-open (In Progress)
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className={`simulator-btn ${isShippingMistake ? "vendor" : "shipping"}`}
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Accepted",
                              isShippingMistake ? "Vendor Mistake" : "Shipping Mistake"
                            )
                          }
                        >
                          {isShippingMistake ? (
                            <>
                              <Store size={13} /> Switch to Vendor Mistake
                            </>
                          ) : (
                            <>
                              <Truck size={13} /> Switch to Shipping Mistake
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn reject"
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Rejected",
                              undefined,
                              "Order return declined per re-inspection policy."
                            )
                          }
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="return-empty-section-card">
              <PackageX size={32} className="text-muted" />
              <p>No return requests have been accepted yet.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: REJECTED RETURNS */}
      {(historySectionFilter === "all" || historySectionFilter === "rejected") && (
        <div className="return-status-section rejected">
          <div className="return-section-header rejected">
            <div className="return-section-header-left">
              <div className="return-section-icon rejected">
                <XCircle size={18} />
              </div>
              <div>
                <h3 className="return-section-title">
                  Rejected Returns
                  <span className="return-section-count-badge rejected">
                    {rejectedReturns.length} Declined
                  </span>
                </h3>
                <p className="return-section-sub">
                  Return requests declined after inspection or past the 7-day guarantee window.
                </p>
              </div>
            </div>
          </div>

          {rejectedReturns.length > 0 ? (
            <div className="returned-history-list">
              {rejectedReturns.map((order) => {
                const req = order.returnRequest;
                const isUpdating = updatingReturnId === order.orderId;

                return (
                  <article key={order.orderId} className="returned-card rejected">
                    <div className="returned-card-header">
                      <div>
                        <div className="returned-order-title">
                          <strong>Order #{order.orderId}</strong>
                          <span className="returned-status-badge rejected">
                            <XCircle size={13} /> Return Declined
                          </span>
                        </div>
                        <span className="returned-date">
                          Declined on {formatDate(req?.rejectedAt || req?.requestedAt || order.createdAt)}
                        </span>
                      </div>
                      <div className="returned-total-tag">
                        {formatRupees(order.totalAmount)}
                      </div>
                    </div>

                    {/* Rejection Details Box */}
                    <div className="rejected-reason-box">
                      <div className="rejected-reason-row">
                        <AlertTriangle size={16} className="text-danger" />
                        <div>
                          <strong>Claimed Return Reason:</strong> {req?.reason || "Defect Claim"}
                        </div>
                      </div>
                      <p className="rejected-explanation">
                        <strong>Inspection Verdict:</strong>{" "}
                        {req?.resolutionNote ||
                          "Return request was declined after warehouse inspection. The product showed evidence of customer usage or defect was reported past the 7-day guarantee window."}
                      </p>
                    </div>

                    {/* Media Proof Preview if attached */}
                    {req?.mediaUrl && (
                      <div className="returned-media-attached-box">
                        <span className="returned-media-label">
                          {req.mediaType === "video" ? (
                            <>
                              <Video size={14} /> Submitted Video Proof
                            </>
                          ) : (
                            <>
                              <ImageIcon size={14} /> Submitted Picture Proof
                            </>
                          )}
                        </span>

                        {req.mediaType === "video" ? (
                          req.mediaUrl.startsWith("http") ? (
                            <a
                              href={req.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="returned-media-link"
                            >
                              <FileVideo size={16} /> Open Video Proof{" "}
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <video
                              src={req.mediaUrl}
                              controls
                              className="returned-preview-video"
                            />
                          )
                        ) : (
                          <img
                            src={req.mediaUrl}
                            alt="Defect proof"
                            className="returned-proof-thumb"
                          />
                        )}
                      </div>
                    )}

                    {/* Admin Financial Settlement Strip */}
                    <div className="order-admin-clearance-strip rejected">
                      <div className="strip-left">
                        <XCircle size={15} className="text-danger" />
                        <div>
                          <span className="strip-label">Admin Financial Status:</span>
                          <strong className="strip-amount rejected">
                            Rs. 0 Cleared (Declined)
                          </strong>
                        </div>
                      </div>
                      <div className="strip-right">
                        <span className="strip-badge rejected">No Amount Credited</span>
                        <span className="strip-hint">Claim declined per policy inspection</span>
                      </div>
                    </div>

                    {/* Decision Simulator */}
                    <div className="return-decision-simulator-bar">
                      <span className="simulator-label">Review Decision (Demo Switcher):</span>
                      <div className="simulator-actions">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn in-progress"
                          onClick={() => onUpdateReturnStatus(order.orderId, "In Progress")}
                        >
                          <Clock size={13} /> Re-open (In Progress)
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn vendor"
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Accepted",
                              "Vendor Mistake",
                              "Re-inspection confirmed vendor defect. Refund credited."
                            )
                          }
                        >
                          <Store size={13} /> Approve (Vendor Mistake)
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="simulator-btn shipping"
                          onClick={() =>
                            onUpdateReturnStatus(
                              order.orderId,
                              "Accepted",
                              "Shipping Mistake",
                              "Re-inspection confirmed courier transit damage. Replacement approved."
                            )
                          }
                        >
                          <Truck size={13} /> Approve (Shipping Mistake)
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="return-empty-section-card">
              <PackageCheck size={32} className="text-muted" />
              <p>No return requests have been rejected.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReturnClaimsView;
