import pandas as pd
import numpy as np
import os
from sklearn.datasets import make_classification

class DataLoader:
    def __init__(self, data_path="data/raw/loan_data.csv"):
        self.data_path = data_path

    def load_data(self) -> pd.DataFrame:
        """
        Loads the dataset from the specified path. 
        If the file does not exist, it generates a realistic synthetic dataset for testing/hackathon purposes.
        """
        if os.path.exists(self.data_path):
            print(f"Loading data from {self.data_path}...")
            return pd.read_csv(self.data_path)
        else:
            print(f"Data file not found at {self.data_path}. Generating synthetic dataset for demonstration...")
            return self._generate_synthetic_data()

    def _generate_synthetic_data(self, n_samples=10000) -> pd.DataFrame:
        """
        Generates a synthetic loan dataset with relevant features.
        """
        # Create a base classification dataset
        X, y = make_classification(
            n_samples=n_samples, n_features=6, n_informative=4, 
            n_redundant=1, n_classes=2, weights=[0.8, 0.2], 
            random_state=42
        )
        
        # Map generated features to financial equivalents
        df = pd.DataFrame(X, columns=['f1', 'f2', 'f3', 'f4', 'f5', 'f6'])
        
        # Income (Log-normal distribution for realism)
        df['annual_income'] = np.random.lognormal(mean=11, sigma=0.5, size=n_samples)
        
        # Loan Amount
        df['loan_amount'] = np.random.uniform(5000, 40000, size=n_samples)
        
        # Existing Debt
        df['existing_debt'] = np.random.uniform(0, 30000, size=n_samples)
        
        # Credit Score (300 to 850)
        # Higher credit score lowers risk (using inverse correlation with target y for demonstration)
        base_score = 650 + (np.random.normal(0, 50, size=n_samples))
        df['credit_score'] = np.clip(base_score - (y * 50), 300, 850)
        
        # Total credit limit
        df['total_credit_limit'] = df['existing_debt'] + np.random.uniform(2000, 20000, size=n_samples)
        
        # Payment Context: Late payments past 30 days
        df['num_late_payments'] = np.random.poisson(lam=0.5 + (y * 1.5), size=n_samples)
        
        # Loan Purpose (Categorical)
        purposes = ['debt_consolidation', 'credit_card', 'home_improvement', 'major_purchase', 'small_business']
        df['loan_purpose'] = np.random.choice(purposes, size=n_samples, p=[0.5, 0.2, 0.1, 0.1, 0.1])
        
        # Employment Length in years
        df['employment_length'] = np.random.randint(0, 11, size=n_samples)

        # Target variable: 1 for Default, 0 for Fully Paid
        df['loan_status'] = y
        
        # Introduce some missing values to simulate real-world data (to be handled in Phase 3)
        np.random.seed(42)
        df.loc[df.sample(frac=0.05).index, 'annual_income'] = np.nan
        df.loc[df.sample(frac=0.02).index, 'employment_length'] = np.nan
        
        # Drop dummy f1-f6 features used for base generation
        df = df.drop(columns=['f1', 'f2', 'f3', 'f4', 'f5', 'f6'])
        
        # Save synthetic data to raw folder
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        df.to_csv(self.data_path, index=False)
        print(f"Synthetic data saved to {self.data_path}")
        
        return df

    def inspect_data(self, df: pd.DataFrame):
        """
        Prints basic information and statistics about the dataset.
        """
        print("-" * 50)
        print("Data Inspection Summary")
        print("-" * 50)
        print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
        print("\nMissing Values:")
        print(df.isnull().sum()[df.isnull().sum() > 0])
        print("\nTarget Class Distribution:")
        print(df['loan_status'].value_counts(normalize=True))
        print("-" * 50)

if __name__ == "__main__":
    loader = DataLoader()
    df = loader.load_data()
    loader.inspect_data(df)
