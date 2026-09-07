import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header/Header.jsx";
import AccountHero from "@/components/sections/AccountHero";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ProfileDetailsCard from "./components/ProfileDetailsCard";
import ProfileBankCard from "./components/ProfileBankCard";
import ProfileSidebar from "./components/ProfileSidebar";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, deleteBankInfo } = useAuth();
  const toast = useToast();

  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingBank, setDeletingBank] = useState(false);

  const isShopNameSet = Boolean(user?.shopName && user.shopName.trim().length > 0);
  const isCitySet = Boolean(user?.city && user.city.trim().length > 0);

  useEffect(() => {
    if (user) {
      setShopName(user.shopName || "");
      setCity(user.city || "");
    }
  }, [user]);

  const handleDeleteBank = async () => {
    if (!window.confirm("Are you sure you want to delete your bank information?")) return;
    setDeletingBank(true);
    try {
      await deleteBankInfo();
      toast.success("Bank information deleted successfully! You can now add new bank details.");
    } catch (err) {
      toast.error(err?.message || "Failed to delete bank info.");
    } finally {
      setDeletingBank(false);
    }
  };

  // Submit Shop Name and City Name updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const payload = {};

    if (!isShopNameSet) {
      if (!shopName.trim()) {
        toast.error("Please enter a valid Shop Name.");
        return;
      }
      payload.shopName = shopName.trim();
    }

    if (!isCitySet) {
      if (!city.trim()) {
        toast.error("Please enter a valid City Name.");
        return;
      }
      payload.city = city.trim();
    }

    if (Object.keys(payload).length === 0) {
      toast.error("All permanent details are already locked.");
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(payload);
      toast.success("Profile details saved! Setting(s) are now permanently locked.");
    } catch (err) {
      toast.error(err?.message || "Failed to save profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Joined";

  return (
    <div className="account-page profile-page-root">
      <Header />
      <AccountHero
        title="Reseller Profile"
        subtitle="View your verified reseller account, city, locked shop details, and bank account information."
      />

      <div className="container profile-container">
        {/* Banner prompt if shopName or city is not set yet */}
        {(!isShopNameSet || !isCitySet) && (
          <div className="profile-banner-alert animate-fade-in">
            <Store size={22} className="profile-banner-icon" />
            <div className="profile-banner-text">
              <strong>Complete Your Reseller Profile!</strong>
              <p>
                {!isShopNameSet && !isCitySet
                  ? "Please enter your Shop Name and City Name below. Note: Once saved, they cannot be changed further."
                  : !isShopNameSet
                  ? "Please enter your Shop Name below. Note: Once saved, your Shop Name cannot be changed further."
                  : "Please enter your City Name below. Note: Once saved, your City Name cannot be changed further."}
              </p>
            </div>
          </div>
        )}

        <div className="profile-grid-layout">
          {/* Main Column */}
          <main className="profile-main-column">
            <ProfileDetailsCard
              user={user}
              shopName={shopName}
              setShopName={setShopName}
              city={city}
              setCity={setCity}
              isShopNameSet={isShopNameSet}
              isCitySet={isCitySet}
              savingProfile={savingProfile}
              onSubmit={handleProfileSubmit}
            />

            <ProfileBankCard
              user={user}
              deletingBank={deletingBank}
              onDeleteBank={handleDeleteBank}
              onAddBank={() => navigate("/profit-account")}
            />
          </main>

          {/* Side Summary Rail */}
          <ProfileSidebar
            user={user}
            formattedJoinDate={formattedJoinDate}
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
